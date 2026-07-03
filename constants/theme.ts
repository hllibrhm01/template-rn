// ─── Brand Colors ─────────────────────────────────────────────────────────────
export const Colors = {
  primary: "#000000",
  primaryDark: "#0d1c32",
  secondary: "#00677e",
  accent: "#ba1a1a",
  secondaryContainer: "#00d2fd",
  onSecondaryContainer: "#005669",
};

// ─── Font Family ──────────────────────────────────────────────────────────────
export const FontFamily = {
  regular: "Manrope_400Regular",
  medium: "Manrope_500Medium",
  semiBold: "Manrope_600SemiBold",
  bold: "Manrope_700Bold",
  extraBold: "Manrope_800ExtraBold",
};

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const Spacing = {
  unit: 8,
  cardGap: 12,
  gutter: 16,
  containerPadding: 20,
  touchTargetMin: 48,
};

// ─── Border Radius ────────────────────────────────────────────────────────────
export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const ambientShadow = {
  shadowColor: "#0d1c32",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.05,
  shadowRadius: 20,
  elevation: 3,
};

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
} as const;

// ─── Design Tokens ────────────────────────────────────────────────────────────
// All hardcoded colors should come from here.

export const lightTokens = {
  // Material Design 3 Surface Hierarchy
  bgBase: "#fbf9fb",
  bgSurface: "#fbf9fb",
  bgElevated: "#ffffff",
  bgSubtle: "#f5f3f5",
  bgMuted: "#efedef",
  glassFallback: "rgba(251,249,251,0.82)",
  glassStroke: "rgba(255,255,255,0.56)",
  glassStrokeMuted: "rgba(197,198,205,0.34)",
  glassTint: "rgba(255,255,255,0.34)",

  // Surface Container Scale
  surfaceContainerLowest: "rgba(255,255,255,0.86)",
  surfaceContainerLow: "rgba(245,243,245,0.78)",
  surfaceContainer: "rgba(239,237,239,0.72)",
  surfaceContainerHigh: "rgba(234,231,234,0.68)",
  surfaceContainerHighest: "rgba(228,226,228,0.64)",
  surfaceVariant: "rgba(228,226,228,0.64)",

  // Text
  textPrimary: "#1b1b1d",
  textSecondary: "#44474d",
  textTertiary: "#75777e",
  textPlaceholder: "#c5c6cd",
  textInverse: "#ffffff",

  // Border / Divider
  borderDefault: "#c5c6cd",
  borderSubtle: "#e4e2e4",
  divider: "#c5c6cd",

  // Semantic
  success: "#34C759",
  successBg: "#ECFDF3",
  successText: "#059669",
  warning: "#F59E0B",
  warningBg: "#FFFBEB",
  warningText: "#D97706",
  danger: "#ba1a1a",
  dangerBg: "#ffdad6",
  dangerText: "#93000a",
  info: "#3B82F6",
  infoBg: "#EFF6FF",
  infoText: "#2563EB",

  // Brand (M3 palette)
  primary: Colors.primary,
  primaryDark: Colors.primaryDark,
  accent: Colors.accent,
  primaryLight: "#d6e3ff",
  secondary: Colors.secondary,
  secondaryLight: "#b4ebff",

  // M3 Color Roles
  primaryContainer: "#0d1c32",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#76849f",
  secondaryContainer: "#00d2fd",
  onSecondaryContainer: "#005669",
  tertiaryFixed: "#ffdcbd",
  onTertiaryFixedVariant: "#5d4124",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  surfaceTint: "#515f78",
  inverseSurface: "#303032",
  inverseOnSurface: "#f2f0f2",
  secondaryFixedDim: "#3cd7ff",
} as const;

export const darkTokens = {
  bgBase: "#0f0f0f",
  bgSurface: "#141414",
  bgElevated: "#1c1c1e",
  bgSubtle: "#1e1e20",
  bgMuted: "#252528",
  glassFallback: "rgba(20,20,20,0.82)",
  glassStroke: "rgba(255,255,255,0.10)",
  glassStrokeMuted: "rgba(255,255,255,0.08)",
  glassTint: "rgba(28,28,30,0.72)",

  surfaceContainerLowest: "rgba(28,28,30,0.86)",
  surfaceContainerLow: "rgba(30,30,32,0.78)",
  surfaceContainer: "rgba(36,36,38,0.72)",
  surfaceContainerHigh: "rgba(45,45,47,0.68)",
  surfaceContainerHighest: "rgba(54,54,56,0.64)",
  surfaceVariant: "rgba(54,54,56,0.64)",

  textPrimary: "#f5f5f7",
  textSecondary: "#a1a1a6",
  textTertiary: "#747478",
  textPlaceholder: "#636366",
  textInverse: "#0f0f0f",

  borderDefault: "#636366",
  borderSubtle: "#3a3a3d",
  divider: "#636366",

  success: "#34C759",
  successBg: "rgba(52,199,89,0.12)",
  successText: "#34C759",
  warning: "#F59E0B",
  warningBg: "rgba(245,158,11,0.12)",
  warningText: "#F59E0B",
  danger: "#FF453A",
  dangerBg: "rgba(255,69,58,0.12)",
  dangerText: "#FF453A",
  info: "#3B82F6",
  infoBg: "rgba(59,130,246,0.12)",
  infoText: "#3B82F6",

  primary: Colors.primary,
  primaryDark: Colors.primaryDark,
  accent: Colors.accent,
  primaryLight: "#d6e3ff",
  secondary: Colors.secondary,
  secondaryLight: "#b4ebff",

  primaryContainer: "#0d1c32",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#76849f",
  secondaryContainer: "#00d2fd",
  onSecondaryContainer: "#005669",
  tertiaryFixed: "#ffdcbd",
  onTertiaryFixedVariant: "#5d4124",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  surfaceTint: "#515f78",
  inverseSurface: "#f2f0f2",
  inverseOnSurface: "#303032",
  secondaryFixedDim: "#3cd7ff",
} as const;

export const tokens = lightTokens;

// Shape of a theme token set. `useTheme()` returns either `lightTokens` or
// `darkTokens`; their values are different string literals, so the keys are
// mapped to `string` here to give one common type both sets satisfy. Screens
// accept it in their `makeStyles(tokens)` factories so styles recompute when
// the color scheme changes.
export type ThemeTokens = { [K in keyof typeof lightTokens]: string };
