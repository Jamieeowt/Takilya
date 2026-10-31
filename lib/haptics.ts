import * as Haptics from 'expo-haptics';

/**
 * Standardized Haptic Feedback Presets for Takilya
 * Following AGENTS.md:
 * "Subtle haptics (expo-haptics)... Press states use a subtle scale spring and a light haptic."
 */

export const haptics = {
  /**
   * For light button touches, chip selections, dismiss handles
   */
  light: () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  },

  /**
   * For medium impact interactions: like heart toggles, bookmarking, primary action commits
   */
  medium: () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
  },

  /**
   * For heavy impact interactions: destructive actions, reorder completions
   */
  heavy: () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
  },

  /**
   * For stepper ticks, tab switches, segmented control changes, rating slider increments
   */
  selection: () => {
    try {
      void Haptics.selectionAsync();
    } catch {}
  },

  /**
   * For successful submissions: logged film saved, offline sync completed
   */
  success: () => {
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  },

  /**
   * For warnings, removal from watchlist, offline fallback
   */
  warning: () => {
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
  },

  /**
   * For error states, failed validation
   */
  error: () => {
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {}
  },
};

