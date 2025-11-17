"use client";

import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      theme="light"
      richColors
      closeButton
      expand
      visibleToasts={3}
      duration={4000}
    />
  );
}
