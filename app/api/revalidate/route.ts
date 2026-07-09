import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * On-demand revalidation endpoint.
 *
 * Call this from the backend (e.g. after a story is published/updated/deleted)
 * to immediately purge the sitemap and story page caches - no waiting for the
 * 30-minute revalidate window.
 *
 * POST /api/revalidate
 * Headers: { Authorization: "Bearer <REVALIDATE_SECRET>" }
 * Body (JSON, all fields optional):
 *   { storyId?: string }   - purge a specific story page
 *   {}                     - purge sitemap only
 */
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  // Require a secret so random callers can't spam revalidation
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { storyId } = body as { storyId?: string };

    // Always revalidate the sitemap
    revalidatePath("/sitemap.xml");

    // If a specific story was published/updated, purge its pages too
    if (storyId) {
      revalidatePath(`/story/${storyId}`);
      revalidatePath(`/story/${storyId}/read`);
    }

    return NextResponse.json({
      revalidated: true,
      storyId: storyId ?? null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Revalidation failed", detail: String(err) },
      { status: 500 },
    );
  }
}

// Health-check - lets you confirm the endpoint exists without side effects
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "revalidate" });
}
