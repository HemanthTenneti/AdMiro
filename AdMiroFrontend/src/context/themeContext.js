"use client";

import React, { createContext, useContext, useMemo } from "react";
import theme from "@/lib/theme";

// Create theme context
const ThemeContext = createContext(undefined);

// Theme Provider Component
export function ThemeProvider({ children }) {
  // Provide the entire theme object and utility functions
  const themeValue = useMemo(
    () => ({
      colors: theme.colors,
      typography: theme.typography,
      spacing: theme.spacing,
      borderRadius: theme.borderRadius,
      shadow: theme.shadow,
      zIndex: theme.zIndex,
      transitions: theme.transitions,
      breakpoints: theme.breakpoints,

      // Helper function to get color
      getColor: (colorPath, defaultColor = "#000") => {
        const keys = colorPath.split(".");
        let value = theme.colors;

        for (const key of keys) {
          if (value && typeof value === "object" && key in value) {
            value = value[key];
          } else {
            return defaultColor;
          }
        }

        return typeof value === "string" ? value : defaultColor;
      },

      // Helper function to create responsive styles
      getSpacing: size => theme.spacing[size] || theme.spacing[0],

      // Get border radius value
      getRadius: size => theme.borderRadius[size] || theme.borderRadius.base,

      // Get shadow value
      getShadow: size => theme.shadow[size] || theme.shadow.none,

      // Get font style
      getFontStyle: (category, variant) => {
        return theme.typography[category]?.[variant] || {};
      },
    }),
    []
  );

  return (
    <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>
  );
}

// Hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}

// Shorthand hooks for common theme values
export function useThemeColors() {
  const { colors } = useTheme();
  return colors;
}

export function useThemeSpacing() {
  const { spacing, getSpacing } = useTheme();
  return { spacing, getSpacing };
}

export function useThemeShadow() {
  const { shadow, getShadow } = useTheme();
  return { shadow, getShadow };
}

export function useThemeTypography() {
  const { typography, getFontStyle } = useTheme();
  return { typography, getFontStyle };
}

export default ThemeContext;
