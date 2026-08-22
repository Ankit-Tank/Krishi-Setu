import React from 'react';
import { Pressable, StyleProp, ViewStyle, GestureResponderEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { AppHaptics } from '../utils/haptics';

interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success';
  scaleTo?: number;
  disabled?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(Pressable);

/**
 * Snappy button micro-interaction component with slight scale-down on tap
 * and integrated cross-platform haptic feedback.
 */
export default function AnimatedPressable({
  children,
  onPress,
  style,
  hapticType = 'medium',
  scaleTo = 0.96,
  disabled = false,
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withTiming(scaleTo, { duration: 90 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, { damping: 14, stiffness: 240 });
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
    <AnimatedTouchable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedTouchable>
  );
}
