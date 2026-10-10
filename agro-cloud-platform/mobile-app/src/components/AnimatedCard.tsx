import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  index?: number;
  duration?: number;
}

/**
 * Fast, snappy (200-250ms) fade-in and slight slide-up entrance animation
 * powered by React Native's built-in Animated (works seamlessly on Web, Expo Go, iOS, Android).
 */
export default function AnimatedCard({
  children,
  style,
  delay,
  index,
  duration = 240,
}: AnimatedCardProps) {
  const computedDelay = delay !== undefined ? delay : (index !== undefined ? Math.min(index * 35, 180) : 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          friction: 7,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();
    }, computedDelay);

    return () => clearTimeout(timer);
  }, [computedDelay, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

