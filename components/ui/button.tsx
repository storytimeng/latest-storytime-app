"use client";
import React, { useState, forwardRef } from "react";
import { Button as BaseButton, PressEvent } from "@heroui/button";

type Variant =
  | "primary"
  | "secondary"
  | "large"
  | "small"
  | "bordered"
  | "ghost"
  | "icon"
  | "danger"
  | "dashed"
  | "google"
  | "skip";

type BaseProps = React.ComponentProps<typeof BaseButton>;

interface Props extends Omit<BaseProps, "className" | "variant" | "onPress"> {
  variant?: Variant;
  className?: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  onPress?:
    | (() => void | Promise<void>)
    | ((e: PressEvent) => void | Promise<void>);
}

/** tiny className combiner */
const cn = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

/** Shared sizing for paired action buttons (Yes/No, Save/Cancel, etc.) */
const actionLayout =
  "inline-flex items-center justify-center min-h-12 h-12 rounded-2xl px-6 body-text-small-medium-auto transition-colors disabled:opacity-50";

const variantClasses: Record<Variant, string> = {
  primary: `${actionLayout} bg-primary-colour hover:bg-primary-shade-6 text-universal-white`,
  secondary:
    "bg-accent-shade-2 text-complimentary-colour rounded-2xl min-h-12 h-12 px-6 inline-flex items-center justify-center body-text-small-medium-auto transition-colors disabled:opacity-50",
  large: `w-full ${actionLayout} bg-primary-colour hover:bg-primary-shade-6 text-universal-white`,
  small: `w-full ${actionLayout} bg-primary-colour hover:bg-primary-shade-6 text-universal-white`,
  bordered: `${actionLayout} border-2 border-primary-colour bg-transparent text-primary-colour hover:bg-accent-shade-1`,
  ghost:
    "bg-transparent text-primary-colour hover:underline px-2 py-1 body-text-small-regular-auto",
  icon: "inline-flex items-center justify-center w-10 h-10 p-0 rounded-full bg-accent-shade-2 text-complimentary-colour body-text-small-medium-auto",
  danger: `${actionLayout} bg-red-600 text-universal-white hover:bg-red-700`,
  dashed:
    "w-full min-h-12 h-12 rounded-2xl border border-dashed border-complimentary-colour bg-transparent text-complimentary-colour px-6 inline-flex items-center justify-center body-text-small-regular-auto",
  google:
    "mb-12 w-full flex items-center justify-center space-x-2 border-2 border-light-grey-2 hover:border-primary-colour hover:bg-accent-shade-3 bg-accent-colour py-3 rounded-3xl body-text-smallest-auto-regular text-primary-colour transition-colors",
  skip: "w-full bg-transparent border-none text-primary-colour hover:text-primary-shade-6 body-text-small-regular-auto p-2 min-w-0 h-auto transition-colors",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = "primary",
    className,
    children,
    startContent,
    endContent,
    onPress,
    ...rest
  },
  ref,
) {
  const [isInternalLoading, setIsInternalLoading] = useState(false);
  const vClass = variantClasses[variant] ?? variantClasses.primary;

  const handleClick = async (e: PressEvent) => {
    if (!onPress) return;

    try {
      setIsInternalLoading(true);
      const result = onPress(e);

      // Check if the result is a Promise
      if (result && typeof result.then === "function") {
        await result;
      }
    } catch (error) {
      console.error("Button onClick error:", error);
    } finally {
      setIsInternalLoading(false);
    }
  };

  // Use external isLoading prop if provided, otherwise use internal loading state
  const shouldShowLoading = rest.isLoading || isInternalLoading;

  return (
    <BaseButton
      ref={ref}
      className={cn(vClass, className)}
      startContent={startContent}
      endContent={endContent}
      onPress={handleClick}
      isLoading={shouldShowLoading}
      {...rest}
    >
      {children}
    </BaseButton>
  );
});

Button.displayName = "Button";
