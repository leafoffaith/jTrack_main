/**
 * JTrack Color Palette
 * Centralized color constants for the application
 */

export const colors = {
  // Bubblegum Pink - Used for new cards, primary actions
  pink: {
    primary: "#ef476f",
    hover: "#d63d5f",
    light: "#f57a96",
    dark: "#c7354f",
  },
  // Carbon Black - Used for text, dark elements
  black: {
    primary: "#1c2321",
    light: "#2a3432",
    dark: "#0f1412",
  },
  // Platinum - Used for background, light elements
  platinum: {
    primary: "#eef1ef",
    light: "#f5f7f5",
    dark: "#d8ddd8",
  },
  // Ocean Blue - Used for due cards, secondary actions
  blue: {
    primary: "#118ab2",
    hover: "#0f7a9d",
    light: "#3ba3c4",
    dark: "#0d6a8a",
  },
  // Blue Gray - Used for accent, tertiary elements
  blueGray: {
    primary: "#6C809A",
    hover: "#5a6d84",
    light: "#8a9db0",
    dark: "#4d5a6b",
  },
} as const;

// Export individual color values for easy access
export const COLOR_PINK = colors.pink.primary;
export const COLOR_BLACK = colors.black.primary;
export const COLOR_PLATINUM = colors.platinum.primary;
export const COLOR_BLUE = colors.blue.primary;
export const COLOR_BLUE_GRAY = colors.blueGray.primary;

// Semantic color mappings
export const semanticColors = {
  newCard: COLOR_PINK,
  dueCard: COLOR_BLUE,
  primary: COLOR_PINK,
  secondary: COLOR_BLUE,
  background: COLOR_PLATINUM,
  foreground: COLOR_BLACK,
  accent: COLOR_BLUE_GRAY,
} as const;
