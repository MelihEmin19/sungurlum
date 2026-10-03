import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface ShimmerBorderProps {
  children: React.ReactNode;
  color?: string;
  borderRadius?: number;
  borderWidth?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Static subtle border with color tint — no continuous animation.
 * Previous version had a withRepeat infinite animation causing frame drops.
 */
function ShimmerBorderInner({
  children,
  color = '#38C0BC',
  borderRadius = 24,
  borderWidth = 1.5,
  style,
}: ShimmerBorderProps) {
  return (
    <Animated.View
      style={[
        {
          borderRadius,
          borderWidth,
          borderColor: `${color}30`,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export default React.memo(ShimmerBorderInner);
