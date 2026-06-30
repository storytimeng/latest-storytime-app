"use client";

/**
 * Android override for /category
 *
 * The web version uses a server component that reads `searchParams` and issues
 * a server-side redirect. That pattern requires a dynamic server and cannot be
 * statically exported for Capacitor.
 *
 * This client version reads the query string directly from `window.location`
 * and redirects using the Next.js router – fully compatible with `output: export`.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { genreToCategorySlug } from "@/lib/genre";

export default function CategoryIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const genre = params.get("genre");

    if (genre?.trim()) {
      router.replace(`/category/${genreToCategorySlug(genre)}`);
    } else {
      router.replace("/all-genres");
    }
  }, [router]);

  // Nothing to render – the effect fires immediately.
  return null;
}
