"use client";

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
  duration?: number; // Optional duration in milliseconds
  position?: ToastPosition;
}

export const showToast = ({
  type,
  message,
  duration = 6000,
  position = "top-center",
}: ToastOptions) => {
  // Define colors for each type
  const toastColors: Record<
    ToastType,
    "success" | "danger" | "primary" | "warning"
  > = {
    success: "success",
    error: "danger",
    info: "primary",
    warning: "warning",
  };

  // Map position to HeroUI placement
  const placementMap: Record<
    ToastPosition,
    | "bottom-right"
    | "bottom-left"
    | "bottom-center"
    | "top-right"
    | "top-left"
    | "top-center"
  > = {
    "top-left": "top-left",
    "top-right": "top-right",
    "bottom-left": "bottom-left",
    "bottom-right": "bottom-right",
    "top-center": "top-center",
    "bottom-center": "bottom-center",
  };

  // Show toast using HeroUI addToast function
  addToast({
    description: message,
    color: toastColors[type],
    timeout: duration,
  });
};
