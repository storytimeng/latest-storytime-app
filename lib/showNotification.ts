import { addToast } from "@heroui/toast";

type ToastType = "success" | "error" | "info" | "warning";
type ToastPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

interface ToastOptions {
  type: ToastType;
  message: string;
  duration?: number;
  position?: ToastPosition;
}

export const showToast = ({
  type,
  message,
  duration = 2000,
  position = "top-center",
}: ToastOptions) => {
  const colorMap: Record<
    ToastType,
    "success" | "danger" | "warning" | "primary"
  > = {
    success: "success",
    error: "danger",
    info: "primary",
    warning: "warning",
  };

  addToast({
    title: message,
    color: colorMap[type],
    timeout: duration,
    // placement: position,
    variant: "solid",
    radius: "md",
    classNames: {
      base: "text-white",
    },
  });
};
