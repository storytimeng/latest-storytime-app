import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://storytime-backend-1-0.onrender.com";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json();
    return NextResponse.json({
      ok: res.ok,
      backend: data,
      pingedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message, pingedAt: new Date().toISOString() },
      { status: 503 },
    );
  }
}
