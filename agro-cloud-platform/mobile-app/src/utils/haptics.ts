import { Platform, Vibration } from 'react-native';

/**
 * Resilient Haptic feedback utility that works across Expo Go, native iOS/Android,
 * and fails gracefully without errors on Web or unsupported devices.
 */
let expoHaptics: any = null;
try {
  expoHaptics = require('expo-haptics');
} catch {
  // Gracefully fallback to react-native Vibration
}

export const AppHaptics = {
  /** Light tap for standard UI interactions (tabs, chips, toggles) */
  light: async () => {
    if (Platform.OS === 'web') return;
    try {
      if (expoHaptics?.impactAsync && expoHaptics.ImpactFeedbackStyle) {
        await expoHaptics.impactAsync(expoHaptics.ImpactFeedbackStyle.Light);
      } else {
        Vibration.vibrate(8);
      }
    } catch {
      // Fallback silently
    }
  },

  /** Medium tap for actionable buttons (scan leaf, soil plan, filter change) */
  medium: async () => {
    if (Platform.OS === 'web') return;
    try {
      if (expoHaptics?.impactAsync && expoHaptics.ImpactFeedbackStyle) {
        await expoHaptics.impactAsync(expoHaptics.ImpactFeedbackStyle.Medium);
      } else {
        Vibration.vibrate(15);
      }
    } catch {
      // Fallback silently
    }
  },

  /** Heavy tap for critical confirmations (accepting buyer match, onboarding submit) */
  heavy: async () => {
    if (Platform.OS === 'web') return;
    try {
      if (expoHaptics?.impactAsync && expoHaptics.ImpactFeedbackStyle) {
        await expoHaptics.impactAsync(expoHaptics.ImpactFeedbackStyle.Heavy);
      } else {
        Vibration.vibrate(25);
      }
    } catch {
      // Fallback silently
    }
  },

  /** Success notification haptic pattern (diagnosis complete, trade confirmed) */
  success: async () => {
    if (Platform.OS === 'web') return;
    try {
      if (expoHaptics?.notificationAsync && expoHaptics.NotificationFeedbackType) {
        await expoHaptics.notificationAsync(expoHaptics.NotificationFeedbackType.Success);
      } else {
        Vibration.vibrate([0, 12, 50, 18]);
      }
    } catch {
      // Fallback silently
    }
  },

  /** Warning notification haptic pattern (disease risk alert) */
  warning: async () => {
    if (Platform.OS === 'web') return;
    try {
      if (expoHaptics?.notificationAsync && expoHaptics.NotificationFeedbackType) {
        await expoHaptics.notificationAsync(expoHaptics.NotificationFeedbackType.Warning);
      } else {
        Vibration.vibrate([0, 25, 40, 25]);
      }
    } catch {
      // Fallback silently
    }
  },

  /** Error notification haptic pattern (validation failure) */
  error: async () => {
    if (Platform.OS === 'web') return;
    try {
      if (expoHaptics?.notificationAsync && expoHaptics.NotificationFeedbackType) {
        await expoHaptics.notificationAsync(expoHaptics.NotificationFeedbackType.Error);
      } else {
        Vibration.vibrate([0, 30, 50, 30, 50, 30]);
      }
    } catch {
      // Fallback silently
    }
  },
};

