"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getStoryCoverSrc, STORY_COVER_FALLBACK } from "@/lib/storyCover";

type StoryCoverImageProps = Omit<ImageProps, "src" | "onError"> & {
  src?: string | null;
};

export function StoryCoverImage({
  src,
  alt = "Story cover",
  className,
  fill,
  style,
  ...props
}: StoryCoverImageProps) {
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setUseFallback(false);
  }, [src]);

  const trimmedSrc = typeof src === "string" ? src.trim() : "";
  const isFallback = useFallback || !trimmedSrc;

  if (isFallback) {
    // Strip object-fit utilities from wrapper so the container fills its slot cleanly
    // while keeping the 96x96 Storytime emblem centered at native crispness.
    const wrapperClass = cn(
      "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFF3E0] via-[#FFE2BC] to-[#F7C68E] dark:from-[#2C1810] dark:via-[#3A2016] dark:to-[#1F110B]",
      className
        ?.replace(/\bobject-(cover|contain|fill|none|scale-down)\b/g, "")
        .trim(),
      fill ? "absolute inset-0 w-full h-full" : "",
    );

    return (
      <div className={wrapperClass} style={style} role="img" aria-label={alt}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(248,149,29,0.22),transparent_65%)]" />
        <Image
          src={STORY_COVER_FALLBACK}
          alt={alt}
          width={96}
          height={96}
          className="relative z-10 h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain drop-shadow-sm select-none"
          priority={props.priority}
        />
      </div>
    );
  }

  // blob: URLs have no hostname for next.config.js remotePatterns to match
  // against, so next/image rejects them outright. Render them as a plain <img>
  // and let the optimizer skip them entirely.
  const isBlobSrc = trimmedSrc.startsWith("blob:");

  if (isBlobSrc) {
    // eslint-disable-next-line @next/next/no-img-element -- blob URLs bypass next/image
    return (
      <img
        src={trimmedSrc}
        alt={alt}
        loading={props.loading ?? "lazy"}
        className={className}
        style={style}
      />
    );
  }

  return (
    <Image
      {...props}
      fill={fill}
      className={className}
      style={style}
      src={getStoryCoverSrc(trimmedSrc)}
      alt={alt}
      onError={() => setUseFallback(true)}
    />
  );
}
