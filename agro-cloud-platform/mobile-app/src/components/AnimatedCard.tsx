import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  index?: number;
  duration?: number;
}

/**
 * Fast, snappy (200-250ms) fade-in and slight slide-up entrance animation
 * powered by react-native-reanimated.
 */
export default function AnimatedCard({
  children,
  style,
  delay,
  index,
  duration = 240,
}: AnimatedCardProps) {
  const computedDelay = delay !== undefined ? delay : (index !== undefined ? Math.min(index * 35, 180) : 0);

  return (
    <Animated.View
      entering={FadeInDown.duration(duration).delay(computedDelay).springify().damping(18)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
