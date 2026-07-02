"use client";

import {
  AnchorHTMLAttributes,
  forwardRef,
  MouseEvent,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { rewriteForCapacitor } from "@/lib/linkRewrite";
import { IS_ANDROID } from "@/lib/platform";

export interface AppLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, AppLinkProps>(
  ({ href, replace = false, scroll = true, onClick, ...props }, ref) => {
    const router = useRouter();
    const finalHref = IS_ANDROID ? rewriteForCapacitor(href) : href;

    const handleClick = useCallback(
      (e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented) return;

        if (
          finalHref.startsWith("http://") ||
          finalHref.startsWith("https://") ||
          finalHref.startsWith("mailto:") ||
          finalHref.startsWith("tel:") ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          e.button !== 0
        ) {
          return;
        }

        e.preventDefault();

        // Plain <a> + router.push, deliberately NOT wrapped in NextLink.
        // NextLink has its own internal click/navigation handling; layering
        // manual preventDefault + router.push on top of it was suspected to
        // race. StoryGroup's story-card navigation uses this exact plain
        // pattern (no NextLink) and has been reliable in every test so far —
        // this isolates whether that's the actual deciding factor.
        if (replace) {
          router.replace(finalHref, { scroll });
        } else {
          router.push(finalHref, { scroll });
        }
      },
      [finalHref, replace, scroll, router, onClick],
    );

    return <a ref={ref} href={finalHref} onClick={handleClick} {...props} />;
  },
);

Link.displayName = "Link";

export default Link;
