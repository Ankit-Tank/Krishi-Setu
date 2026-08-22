import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Resilient Haptic feedback utility that works across Expo Go, native iOS/Android,
 * and fails gracefully without errors on Web or unsupported devices.
 */
export const AppHaptics = {
  /** Light tap for standard UI interactions (tabs, chips, toggles) */
  light: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback silently if unsupported
    }
  },

  /** Medium tap for actionable buttons (scan leaf, soil plan, filter change) */
  medium: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Fallback silently if unsupported
    }
  },

  /** Heavy tap for critical confirmations (accepting buyer match, onboarding submit) */
  heavy: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // Fallback silently if unsupported
    }
  },

  /** Success notification haptic pattern (diagnosis complete, trade confirmed) */
  success: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Fallback silently if unsupported
    }
  },

  /** Warning notification haptic pattern (disease risk alert) */
  warning: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // Fallback silently if unsupported
    }
  },

  /** Error notification haptic pattern (validation failure) */
  error: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // Fallback silently if unsupported
    }
  },
};
