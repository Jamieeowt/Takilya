/**
 * Takilya Theme System
 * Dark cinematic theme with near-black obsidian background and warm gold accents.
 * Designed specifically for Philippine film discovery, reviews, and trailers.
 */

export const colors = {
  // Near-black backgrounds
  background: {
    primary: '#08080A',     // Deep obsidian cinema canvas
    secondary: '#111116',   // Cards, sheet surfaces
    tertiary: '#181820',    // Elevated elements, list rows, inputs
    elevated: '#21212C',    // Popovers, floating pills, dialogs
    overlay: 'rgba(0, 0, 0, 0.75)',
  },

  // Warm Gold Accents (Takilya signature)
  gold: {
    primary: '#E5B842',     // Radiant warm gold
    secondary: '#C89B2B',   // Deep rich gold
    light: '#F8DC7B',       // Highlight gold
    dark: '#916B15',        // Subdued antique gold
    subtle: 'rgba(229, 184, 66, 0.12)', // Tinted chip background
    subtleBorder: 'rgba(229, 184, 66, 0.30)',
    glow: 'rgba(229, 184, 66, 0.25)',
  },

  // Text hierarchy
  text: {
    primary: '#FBFBFC',     // High-contrast clean white
    secondary: '#ABABBA',   // Muted silver for subtitles/meta
    tertiary: '#6C6C7E',    // Dim grey for timestamps, tags
    gold: '#E5B842',        // Accent text
    inverse: '#08080A',     // Text on gold buttons
  },

  // Borders & Dividers
  border: {
    subtle: '#1C1C26',
    default: '#272736',
    strong: '#38384D',
    gold: 'rgba(229, 184, 66, 0.40)',
  },

  // Domain-specific badges & scores (from AGENTS.md)
  film: {
    criticScore: '#E5B842',      // Critic gold star score
    audienceScore: '#F59E0B',    // Audience amber popcorn score
    verifiedBadge: '#38BDF8',    // Verified official (studios/festivals/artists)
    promotedBadge: '#FBBF24',    // Clear Promoted tag
    heritageBadge: '#F472B6',    // National Artists / Preserved films
  },

  // System states
  status: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export const typography = {
  titleLarge: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text.primary,
    letterSpacing: 0.3,
  },
  titleMedium: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text.primary,
    letterSpacing: 0.2,
  },
  titleSmall: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.text.tertiary,
    lineHeight: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  meta: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: colors.text.tertiary,
  },
};

/**
 * Navigation theme tailored for React Navigation / Expo Router ThemeProvider
 */
export const TakilyaNavigationTheme = {
  dark: true,
  colors: {
    primary: colors.gold.primary,
    background: colors.background.primary,
    card: colors.background.secondary,
    text: colors.text.primary,
    border: colors.border.subtle,
    notification: colors.gold.primary,
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700' as const,
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '800' as const,
    },
  },
};

export default {
  colors,
  spacing,
  radius,
  typography,
  navigationTheme: TakilyaNavigationTheme,
};

