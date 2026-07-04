"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { getStoryCoverSrc, STORY_COVER_FALLBACK } from "@/lib/storyCover";

type StoryCoverImageProps = Omit<ImageProps, "src" | "onError"> & {
  src?: string | null;
};

export function StoryCoverImage({
  src,
  alt = "Story cover",
  ...props
}: StoryCoverImageProps) {
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setUseFallback(false);
  }, [src]);

  // blob: URLs have no hostname for next.config.js remotePatterns to match
  // against, so next/image rejects them outright. Render them as a plain <img>
  // and let the optimizer skip them entirely.
  const isBlobSrc = typeof src === "string" && src.startsWith("blob:");

  if (isBlobSrc) {
    // eslint-disable-next-line @next/next/no-img-element -- blob URLs bypass next/image
    return (
      <img
        src={src as string}
        alt={alt}
        loading={props.loading ?? "lazy"}
        className={props.className}
        style={props.style}
      />
    );
  }

  const resolvedSrc = useFallback
    ? STORY_COVER_FALLBACK
    : getStoryCoverSrc(src);

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={alt}
      onError={() => setUseFallback(true)}
    />
  );
}
