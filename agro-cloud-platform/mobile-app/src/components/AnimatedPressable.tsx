import React, { useRef } from 'react';
import {
  Pressable,
  Animated,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { AppHaptics } from '../utils/haptics';

interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success';
  scaleTo?: number;
  disabled?: boolean;
}

/**
 * Snappy button micro-interaction component with slight scale-down on tap
 * and integrated cross-platform haptic feedback (works everywhere: Web, iOS, Android, Expo Go).
 */
export default function AnimatedPressable({
  children,
  onPress,
  style,
  hapticType = 'medium',
  scaleTo = 0.96,
  disabled = false,
}: AnimatedPressableProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.timing(scaleAnim, {
      toValue: scaleTo,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = (e: GestureResponderEvent) => {
    if (disabled) return;
    if (hapticType === 'light') AppHaptics.light();
    else if (hapticType === 'heavy') AppHaptics.heavy();
    else if (hapticType === 'success') AppHaptics.success();
    else AppHaptics.medium();

    onPress?.(e);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

