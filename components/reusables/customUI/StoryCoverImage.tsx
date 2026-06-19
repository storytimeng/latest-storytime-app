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
