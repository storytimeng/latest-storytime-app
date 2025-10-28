"use client";
import React, { useState, forwardRef } from "react";
import { Button as BaseButton } from "@heroui/react";

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

interface Props extends Omit<BaseProps, "className" | "variant" | "onClick"> {
  variant?: Variant;
  className?: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  onClick?:
    | (() => void | Promise<void>)
    | ((e: React.MouseEvent) => void | Promise<void>);
}

/** tiny className combiner */
const cn = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary-colour hover:bg-primary-shade-6 text-universal-white rounded-2xl py-4 px-6 body-text-small-medium-auto transition-colors disabled:opacity-50",
  secondary:
    "bg-accent-shade-2 text-complimentary-colour rounded-[12px] py-2 px-4 body-text-small-medium-auto transition-colors disabled:opacity-50",
  large:
    "w-full bg-primary-colour hover:bg-primary-shade-6 text-universal-white py-4 rounded-2xl body-text-small-medium-auto transition-colors disabled:opacity-50",
  small:
    "w-full h-[48px] bg-primary-colour hover:bg-primary-shade-6 text-universal-white rounded-[8px] py-4 px-6 body-text-small-medium-auto transition-colors disabled:opacity-50",
  bordered:
    "w-full h-[48px] rounded-[8px] border border-primary-colour bg-transparent text-primary-colour py-2 px-4 body-text-small-regular-auto",
  ghost:
    "bg-transparent text-primary-colour hover:underline px-2 py-1 body-text-small-regular-auto",
  icon: "inline-flex items-center justify-center w-10 h-10 p-0 rounded-full bg-accent-shade-2 text-complimentary-colour body-text-small-medium-auto",
  danger:
    "w-[165px] rounded-[8px] bg-red-600 text-universal-white py-2 px-4 hover:bg-red-700 body-text-big-medium-auto transition-colors",
  dashed:
    "w-[335px] h-[48px] rounded-[8px] border border-dashed border-complimentary-colour bg-transparent text-complimentary-colour py-2 px-4 body-text-small-regular-auto",
  google:
    "mb-12 w-full flex items-center justify-center space-x-2 border-2 border-light-grey-2 hover:border-primary-colour hover:bg-accent-shade-3 bg-accent-colour py-3 rounded-3xl body-text-smallest-auto-regular text-primary-colour transition-colors",
  skip: "bg-transparent border-none text-primary-colour hover:text-primary-shade-6 body-text-small-regular-auto p-2 min-w-0 h-auto transition-colors",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = "primary",
    className,
    children,
    startContent,
    endContent,
    onClick,
    ...rest
  },
  ref
) {
  const [isInternalLoading, setIsInternalLoading] = useState(false);
  const vClass = variantClasses[variant] ?? variantClasses.primary;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClick) return;

    const executeClick = async () => {
      try {
        setIsInternalLoading(true);
        const result = onClick(e);

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

    executeClick();
  };

  // Use external isLoading prop if provided, otherwise use internal loading state
  const shouldShowLoading = rest.isLoading || isInternalLoading;

  // Destructure onClick from rest to avoid conflicts
  const { onPress: _, ...buttonProps } = rest as BaseProps;

  return (
    <BaseButton
      ref={ref}
      className={cn(vClass, className)}
      startContent={startContent}
      endContent={endContent}
      // @ts-expect-error - HeroUI Button onClick type is incompatible with our handler
      onPress={handleClick}
      isLoading={shouldShowLoading}
      {...buttonProps}
    >
      {children}
    </BaseButton>
  );
});

Button.displayName = "Button";
