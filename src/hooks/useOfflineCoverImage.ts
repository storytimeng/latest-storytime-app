// hooks/useOfflineCoverImage.ts
import { useEffect, useState } from "react";

/**
 * Turns a stored cover Blob into a displayable object URL.
 * Falls back to `fallbackUrl` (the original remote imageUrl) when there's
 * no blob — e.g. for stories downloaded before this feature existed.
 * Revokes the object URL on cleanup to avoid leaking memory.
 */
export function useOfflineCoverImage(blob?: Blob, fallbackUrl?: string) {
  const [src, setSrc] = useState<string | undefined>(fallbackUrl);

  useEffect(() => {
    if (!blob) {
      setSrc(fallbackUrl);
      return;
    }
    const objectUrl = URL.createObjectURL(blob);
    setSrc(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob, fallbackUrl]);

  return src;
}
