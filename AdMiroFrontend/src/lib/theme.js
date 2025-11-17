/**
 * AdMiro Theme System
 * Single light theme with comprehensive design tokens
 */

export const theme = {
  // Color Palette
  colors: {
    // Primary Colors
    primary: {
      light: "#d4c4a8",
      main: "#8b6f47",
      dark: "#5f4a2f",
      darker: "#3d2f1f",
    },

    // Secondary Colors
    secondary: {
      light: "#f5e6d3",
      main: "#c9a876",
      dark: "#9d7e52",
    },

    // Neutral Colors
    neutral: {
      50: "#fafaf9", // lightest - backgrounds
      100: "#f5f3f0", // lighter backgrounds
      200: "#e8e4df",
      300: "#d9d4cd",
      400: "#c4bdb3",
      500: "#a8a099",
      600: "#8b837a",
      700: "#6b6460",
      800: "#524c46",
      900: "#3a3530",
      950: "#2a2520",
    },

    // Semantic Colors
    success: {
      light: "#d1f4e0",
      main: "#10b981",
      dark: "#059669",
    },

    error: {
      light: "#fee2e2",
      main: "#ef4444",
      dark: "#dc2626",
    },

    warning: {
      light: "#fef3c7",
      main: "#f59e0b",
      dark: "#d97706",
    },

    info: {
      light: "#dbeafe",
      main: "#3b82f6",
      dark: "#1d4ed8",
    },

    // Background Colors
    background: {
      default: "#fafaf9",
      secondary: "#f5f3f0",
      tertiary: "#e8e4df",
    },

    // Text Colors
    text: {
      primary: "#3a3530",
      secondary: "#6b6460",
      tertiary: "#a8a099",
      light: "#c4bdb3",
      inverse: "#fafaf9",
    },

    // Border Colors
    border: {
      light: "#e8e4df",
      main: "#d9d4cd",
      dark: "#c4bdb3",
    },

    // Component specific
    input: {
      background: "#fff",
      border: "#d9d4cd",
      borderFocus: "#8b6f47",
      text: "#3a3530",
    },

    // Status colors
    status: {
      success: "#10b981",
      pending: "#f59e0b",
      inactive: "#6b6460",
    },
  },

  // Typography
  typography: {
    // Font families
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
    },

    // Font sizes (in rem)
    fontSize: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
      "6xl": "3.75rem", // 60px
    },

    // Font weights
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },

    // Line heights
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },

    // Letter spacing
    letterSpacing: {
      tighter: "-0.05em",
      tight: "-0.025em",
      normal: "0em",
      wide: "0.025em",
      wider: "0.05em",
      widest: "0.1em",
    },

    // Predefined text styles
    heading: {
      h1: {
        fontSize: "2.25rem", // 36px
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "-0.025em",
      },
      h2: {
        fontSize: "1.875rem", // 30px
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: "-0.025em",
      },
      h3: {
        fontSize: "1.5rem", // 24px
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: "0em",
      },
      h4: {
        fontSize: "1.25rem", // 20px
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: "0em",
      },
      h5: {
        fontSize: "1.125rem", // 18px
        fontWeight: 600,
        lineHeight: 1.5,
        letterSpacing: "0em",
      },
      h6: {
        fontSize: "1rem", // 16px
        fontWeight: 600,
        lineHeight: 1.5,
        letterSpacing: "0em",
      },
    },

    body: {
      large: {
        fontSize: "1rem",
        fontWeight: 400,
        lineHeight: 1.625,
        letterSpacing: "0em",
      },
      base: {
        fontSize: "0.875rem",
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: "0em",
      },
      small: {
        fontSize: "0.75rem",
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: "0em",
      },
    },

    label: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: "0em",
    },

    caption: {
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: "0em",
    },
  },

  // Spacing System (8px base)
  spacing: {
    0: "0",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    5: "1.25rem", // 20px
    6: "1.5rem", // 24px
    7: "1.75rem", // 28px
    8: "2rem", // 32px
    9: "2.25rem", // 36px
    10: "2.5rem", // 40px
    12: "3rem", // 48px
    14: "3.5rem", // 56px
    16: "4rem", // 64px
    20: "5rem", // 80px
    24: "6rem", // 96px
    28: "7rem", // 112px
    32: "8rem", // 128px
    36: "9rem", // 144px
    40: "10rem", // 160px
    44: "11rem", // 176px
    48: "12rem", // 192px
    52: "13rem", // 208px
    56: "14rem", // 224px
    60: "15rem", // 240px
    64: "16rem", // 256px
    72: "18rem", // 288px
    80: "20rem", // 320px
    96: "24rem", // 384px
  },

  // Border Radius
  borderRadius: {
    none: "0",
    xs: "0.25rem", // 4px
    sm: "0.375rem", // 6px
    base: "0.5rem", // 8px
    md: "0.75rem", // 12px
    lg: "1rem", // 16px
    xl: "1.5rem", // 24px
    "2xl": "2rem", // 32px
    "3xl": "2.5rem", // 40px
    full: "9999px",
  },

  // Shadows
  shadow: {
    none: "none",

    // Subtle shadows
    xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
    base: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    md: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    lg: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    xl: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",

    // Inner shadows
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",

    // Elevated shadows (for cards)
    elevation: {
      1: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      2: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      3: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      4: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    },

    // Hover/Focus shadows
    focus: "0 0 0 3px rgba(139, 111, 71, 0.1)",
    focusRing: "0 0 0 3px rgba(139, 111, 71, 0.2)",
  },

  // Z-index scale
  zIndex: {
    hide: "-1",
    auto: "auto",
    base: "0",
    dropdown: "1000",
    sticky: "1020",
    fixed: "1030",
    modal: "1040",
    popover: "1050",
    tooltip: "1060",
    notification: "1070",
  },

  // Transitions & Animations
  transitions: {
    fast: "150ms ease-in-out",
    base: "250ms ease-in-out",
    slow: "350ms ease-in-out",
    slower: "500ms ease-in-out",
  },

  // Breakpoints
  breakpoints: {
    xs: "320px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};

// Helper function to get color with fallback
export const getColor = (colorPath, defaultColor = "#000") => {
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
};

// Helper function to create CSS custom properties
export const createCSSVariables = () => {
  const variables = {};

  const flattenObject = (obj, prefix = "") => {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const cssVarName = `--${prefix ? prefix + "-" : ""}${key}`
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase();

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        flattenObject(value, cssVarName.substring(2));
      } else if (typeof value === "string" || typeof value === "number") {
        variables[cssVarName] = value;
      }
    });
  };

  flattenObject(theme.colors, "color");
  flattenObject(theme.spacing, "space");
  flattenObject(theme.typography.fontSize, "font-size");
  flattenObject(theme.borderRadius, "radius");
  flattenObject(theme.shadow, "shadow");

  return variables;
};

export default theme;
