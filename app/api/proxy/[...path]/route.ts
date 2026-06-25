import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://storytime-backend-1-0.onrender.com";

const DEBUG_PROXY = process.env.NEXT_PUBLIC_DEBUG_PROXY === "true";

/** Narration generation can take minutes; polling uses short requests. */
const DEFAULT_PROXY_TIMEOUT_MS = 55_000; // Render free tier cold-start can take ~45s
const AUDIO_PROXY_TIMEOUT_MS = 120_000;

function getProxyTimeoutMs(apiPath: string, method: string): number {
  if (method === "GET" && /\/stories\/[^/]+\/audio$/.test(apiPath)) {
    return AUDIO_PROXY_TIMEOUT_MS;
  }
  return DEFAULT_PROXY_TIMEOUT_MS;
}

/** Headers that must never be forwarded from client → backend */
const BLOCKED_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "accept-encoding",
  "transfer-encoding",
]);

/** Response headers that must be forwarded from backend → client */
const FORWARDED_RESPONSE_HEADERS = new Set([
  "content-type",
  "cache-control",
  "etag",
  "last-modified",
  "set-cookie", // Critical: httpOnly refresh token cookie must reach the browser
]);

function classifyNetworkError(error: any): { status: number; message: string } {
  const msg: string = error?.message || "";
  if (error?.name === "TimeoutError" || msg.includes("timeout")) {
    return {
      status: 504,
      message:
        "Backend timed out. The server may be waking from sleep — please retry in a few seconds.",
    };
  }
  if (
    msg.includes("ECONNREFUSED") ||
    msg.includes("ENOTFOUND") ||
    msg.includes("EAI_AGAIN")
  ) {
    return {
      status: 502,
      message: "Backend is unreachable. Please try again shortly.",
    };
  }
  return { status: 502, message: "Proxy request failed. Please try again." };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path, "PUT");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path, "DELETE");
}

async function proxyRequest(
  request: NextRequest,
  path: string[],
  method: string,
) {
  const apiPath = path.join("/");
  const url = `${BACKEND_URL}/${apiPath}`;

  // Get search params
  const searchParams = request.nextUrl.searchParams.toString();
  const fullUrl = searchParams ? `${url}?${searchParams}` : url;

  // Get request body if not GET/DELETE
  let body = undefined;
  let parsedBody = undefined;
  if (method !== "GET" && method !== "DELETE") {
    try {
      const contentType = request.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const text = await request.text();
        body = text;
        parsedBody = text ? JSON.parse(text) : undefined;
      } else {
        // For multipart/form-data or binary, use arrayBuffer
        const buffer = await request.arrayBuffer();
        body = buffer;
        // Optionally try to parse if it's possible it's JSON hidden without header
        // but for now let's be strict
      }
    } catch (e) {
      // No body or error parsing
      console.error("[PROXY BODY ERROR]", e);
    }
  }

  // Log request details on server console
  console.log(`\n[PROXY ${method}] ${fullUrl}`);
  if (parsedBody) {
    console.log(`[PROXY BODY]`, parsedBody);
  }

  try {
    // Forward request headers (excluding blocked ones)
    const headers: HeadersInit = {};
    request.headers.forEach((value, key) => {
      if (!BLOCKED_REQUEST_HEADERS.has(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    // Make request to backend
    const response = await fetch(fullUrl, {
      method,
      headers,
      body,
      signal: AbortSignal.timeout(getProxyTimeoutMs(apiPath, method)),
    });

    // Get response body as text (fetch automatically decompresses)
    const responseData = await response.text();
    let parsedResponse: any = undefined;
    try {
      parsedResponse = JSON.parse(responseData);
    } catch {
      // Not JSON — pass through as-is
    }

    if (DEBUG_PROXY) {
      console.log(
        `[PROXY RESPONSE ${response.status}]`,
        parsedResponse || responseData.substring(0, 200),
      );
    }

    // Attach debug info only in debug mode
    if (DEBUG_PROXY && parsedResponse) {
      parsedResponse._debug = {
        endpoint: fullUrl,
        method,
        responseStatus: response.status,
        timestamp: new Date().toISOString(),
      };
    }

    // Build Next.js response
    const noBody =
      response.status === 204 ||
      response.status === 205 ||
      response.status === 304;

    const nextResponse = noBody
      ? new NextResponse(null, {
          status: response.status,
          statusText: response.statusText,
        })
      : parsedResponse
        ? NextResponse.json(parsedResponse, {
            status: response.status,
            statusText: response.statusText,
          })
        : new NextResponse(responseData, {
            status: response.status,
            statusText: response.statusText,
            headers: {
              "Content-Type":
                response.headers.get("content-type") || "text/plain",
            },
          });

    // Forward safe response headers, including Set-Cookie for httpOnly auth cookies
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        FORWARDED_RESPONSE_HEADERS.has(lowerKey) ||
        lowerKey.startsWith("x-")
      ) {
        // set-cookie must use append (multiple cookies are separate header lines)
        if (lowerKey === "set-cookie") {
          nextResponse.headers.append(key, value);
        } else {
          nextResponse.headers.set(key, value);
        }
      }
    });

    // Add CORS headers
    nextResponse.headers.set("Access-Control-Allow-Origin", "*");
    nextResponse.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    );
    nextResponse.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With",
    );

    return nextResponse;
  } catch (error: any) {
    console.error(`[PROXY ERROR] ${method} ${fullUrl}`, error?.message);

    const { status, message } = classifyNetworkError(error);

    return NextResponse.json(
      {
        error: "Proxy request failed",
        message,
        ...(DEBUG_PROXY && {
          _debug: {
            endpoint: fullUrl,
            method,
            errorMessage: error.message,
            errorStack: error.stack,
            timestamp: new Date().toISOString(),
          },
        }),
      },
      { status },
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Max-Age": "86400",
    },
  });
}
