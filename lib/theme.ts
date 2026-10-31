/**
 * Takilya Strict Black & White Design System
 * 
 * AGENTS.md rules:
 * - Strict black and white only: pure black #000000 and white #FFFFFF plus a gray ramp:
 *   #0A0A0A, #141414, #1F1F1F, #2E2E2E, #8A8A8A, #D4D4D4, #F5F5F5.
 * - No other hue anywhere, including badges, charts, and errors.
 * - Tell states apart by fill vs outline, weight, icon, and label, never by color.
 * - Dark mode is default (black background, white text); light mode inverts it (white background, black text).
 * - 8px spacing grid, 1px hairline borders at 12% white (or black), 16 to 24px card radii, fully round pills.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

export type ThemeMode = 'dark' | 'light';

// ==============================================================================
// 1. STRICT MONOCHROME COLOR TOKENS
// ==============================================================================

export const grayRamp = {
  black: '#000000',
  gray900: '#0A0A0A',
  gray850: '#141414',
  gray800: '#1F1F1F',
  gray700: '#2E2E2E',
  gray500: '#8A8A8A',
  gray300: '#D4D4D4',
  gray100: '#F5F5F5',
  white: '#FFFFFF',
} as const;

export const darkTokens = {
  mode: 'dark' as ThemeMode,
  background: {
    primary: '#000000',
    secondary: '#0A0A0A',
    tertiary: '#141414',
    elevated: '#1F1F1F',
    muted: '#2E2E2E',
    overlay: 'rgba(0, 0, 0, 0.85)',
    glass: 'rgba(10, 10, 10, 0.75)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#D4D4D4',
    tertiary: '#8A8A8A',
    muted: '#8A8A8A',
    inverse: '#000000',
  },
  border: {
    hairline: 'rgba(255, 255, 255, 0.12)', // 1px 12% white
    subtle: 'rgba(255, 255, 255, 0.12)',
    default: 'rgba(255, 255, 255, 0.18)',
    strong: 'rgba(255, 255, 255, 0.35)',
    contrast: '#FFFFFF',
  },
  action: {
    primaryBg: '#FFFFFF',
    primaryText: '#000000',
    secondaryBg: 'transparent',
    secondaryBorder: 'rgba(255, 255, 255, 0.35)',
    secondaryText: '#FFFFFF',
    ghostBg: 'transparent',
    ghostText: '#FFFFFF',
  },
  badge: {
    wonBg: '#FFFFFF',
    wonText: '#000000',
    wonBorder: '#FFFFFF',
    nominatedBg: 'transparent',
    nominatedText: '#FFFFFF',
    nominatedBorder: '#FFFFFF',
    selectionBg: 'transparent',
    selectionText: '#D4D4D4',
    selectionBorder: '#8A8A8A',
    specialBg: 'transparent',
    specialText: '#FFFFFF',
    specialBorder: '#FFFFFF',
  },
} as const;

export const lightTokens = {
  mode: 'light' as ThemeMode,
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#D4D4D4',
    elevated: '#F5F5F5',
    muted: '#D4D4D4',
    overlay: 'rgba(255, 255, 255, 0.85)',
    glass: 'rgba(245, 245, 245, 0.75)',
  },
  text: {
    primary: '#000000',
    secondary: '#2E2E2E',
    tertiary: '#8A8A8A',
    muted: '#8A8A8A',
    inverse: '#FFFFFF',
  },
  border: {
    hairline: 'rgba(0, 0, 0, 0.12)', // 1px 12% black
    subtle: 'rgba(0, 0, 0, 0.12)',
    default: 'rgba(0, 0, 0, 0.18)',
    strong: 'rgba(0, 0, 0, 0.35)',
    contrast: '#000000',
  },
  action: {
    primaryBg: '#000000',
    primaryText: '#FFFFFF',
    secondaryBg: 'transparent',
    secondaryBorder: 'rgba(0, 0, 0, 0.35)',
    secondaryText: '#000000',
    ghostBg: 'transparent',
    ghostText: '#000000',
  },
  badge: {
    wonBg: '#000000',
    wonText: '#FFFFFF',
    wonBorder: '#000000',
    nominatedBg: 'transparent',
    nominatedText: '#000000',
    nominatedBorder: '#000000',
    selectionBg: 'transparent',
    selectionText: '#2E2E2E',
    selectionBorder: '#8A8A8A',
    specialBg: 'transparent',
    specialText: '#000000',
    specialBorder: '#000000',
  },
} as const;

export type ThemeTokens = typeof darkTokens;

// ==============================================================================
// 2. 8PX SPACING GRID & RADII
// ==============================================================================

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  hero: 64,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  card: 16,        // 16px standard card radius
  cardLarge: 24,   // 24px large card radius
  full: 9999,      // Fully round pills
} as const;

// ==============================================================================
// 3. TYPOGRAPHY (Inter / System with tight tracking)
// ==============================================================================

export const typography = {
  display: {
    fontFamily: Platform.select({ ios: 'Inter-Bold', android: 'Inter_700Bold', default: 'System' }),
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  titleLarge: {
    fontFamily: Platform.select({ ios: 'Inter-Bold', android: 'Inter_700Bold', default: 'System' }),
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  titleMedium: {
    fontFamily: Platform.select({ ios: 'Inter-SemiBold', android: 'Inter_600SemiBold', default: 'System' }),
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  titleSmall: {
    fontFamily: Platform.select({ ios: 'Inter-SemiBold', android: 'Inter_600SemiBold', default: 'System' }),
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  title: {
    fontFamily: Platform.select({ ios: 'Inter-SemiBold', android: 'Inter_600SemiBold', default: 'System' }),
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  body: {
    fontFamily: Platform.select({ ios: 'Inter-Regular', android: 'Inter_400Regular', default: 'System' }),
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  bodySmall: {
    fontFamily: Platform.select({ ios: 'Inter-Regular', android: 'Inter_400Regular', default: 'System' }),
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  caption: {
    fontFamily: Platform.select({ ios: 'Inter-Medium', android: 'Inter_500Medium', default: 'System' }),
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  label: {
    fontFamily: Platform.select({ ios: 'Inter-SemiBold', android: 'Inter_600SemiBold', default: 'System' }),
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.4,
    textTransform: 'uppercase' as const,
  },
  mono: {
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 0,
  },
  meta: {
    fontFamily: Platform.select({ ios: 'Inter-Regular', android: 'Inter_400Regular', default: 'System' }),
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
  },
};

// ==============================================================================
// 4. BACKWARD-COMPATIBLE DEFAULT COLORS (Strict Monochrome)
// ==============================================================================

export const colors = {
  background: {
    primary: darkTokens.background.primary,
    secondary: darkTokens.background.secondary,
    tertiary: darkTokens.background.tertiary,
    elevated: darkTokens.background.elevated,
    overlay: darkTokens.background.overlay,
  },
  text: {
    primary: darkTokens.text.primary,
    secondary: darkTokens.text.secondary,
    tertiary: darkTokens.text.tertiary,
    gold: '#FFFFFF', // Monochrome mapped
    inverse: darkTokens.text.inverse,
  },
  border: {
    subtle: darkTokens.border.subtle,
    default: darkTokens.border.default,
    strong: darkTokens.border.strong,
    gold: darkTokens.border.contrast,
  },
  // Strict Monochrome Domain states (fill vs outline, never hue)
  gold: {
    primary: '#FFFFFF',
    secondary: '#D4D4D4',
    light: '#FFFFFF',
    dark: '#8A8A8A',
    subtle: 'rgba(255, 255, 255, 0.12)',
    subtleBorder: 'rgba(255, 255, 255, 0.24)',
    glow: 'rgba(255, 255, 255, 0.15)',
  },
  film: {
    criticScore: '#FFFFFF',
    audienceScore: '#D4D4D4',
    verifiedBadge: '#FFFFFF',
    promotedBadge: '#FFFFFF',
    heritageBadge: '#FFFFFF',
  },
  status: {
    success: '#FFFFFF',
    error: '#FFFFFF',
    warning: '#D4D4D4',
    info: '#FFFFFF',
  },
} as const;

// ==============================================================================
// 5. REACT CONTEXT: THEME PROVIDER & USE THEME HOOK
// ==============================================================================

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  tokens: ThemeTokens;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  isDark: true,
  tokens: darkTokens,
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({
  children,
  initialTheme = 'dark',
}: {
  children: React.ReactNode;
  initialTheme?: ThemeMode;
}) {
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';
  const tokens = isDark ? darkTokens : (lightTokens as unknown as ThemeTokens);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        tokens,
        setTheme,
        toggleTheme,
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Navigation Theme for React Navigation / Expo Router
export const TakilyaNavigationTheme = {
  dark: true,
  colors: {
    primary: '#FFFFFF',
    background: '#000000',
    card: '#0A0A0A',
    text: '#FFFFFF',
    border: 'rgba(255, 255, 255, 0.12)',
    notification: '#FFFFFF',
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '800' as const },
  },
};

export default {
  colors,
  darkTokens,
  lightTokens,
  grayRamp,
  spacing,
  radius,
  typography,
  ThemeProvider,
  useTheme,
  navigationTheme: TakilyaNavigationTheme,
};
