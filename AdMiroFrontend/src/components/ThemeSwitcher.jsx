"use client";

import { useThemeStore } from "@/context/themeStore";

export default function ThemeSwitcher() {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-[#e5e5e5] dark:border-[#373737] hover:bg-[#f7f6f3] dark:hover:bg-[#262626] transition-colors"
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
