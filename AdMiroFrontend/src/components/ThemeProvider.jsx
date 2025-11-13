"use client";

import { useEffect } from "react";

export default function ThemeProvider({ children }) {
  useEffect(() => {
    // Light mode only - remove any dark class that might exist
    document.documentElement.classList.remove("dark");
  }, []);

  return children;
}
