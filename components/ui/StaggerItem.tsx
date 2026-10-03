import React, { useEffect } from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface StaggerItemProps {
  children: React.ReactNode;
  index: number;
  delay?: number;
  initialDelay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

function StaggerItemInner({
  children,
  index,
  delay = 100,
  initialDelay = 150,
  duration = 400,
  style,
  direction = 'up',
  distance = 20,
}: StaggerItemProps) {
  const opacity = useSharedValue(0);
  const translate = useSharedValue(
    direction === 'up' ? distance : direction === 'down' ? -distance :
    direction === 'left' ? -distance : distance
  );

  useEffect(() => {
    const totalDelay = initialDelay + index * delay;
    const isVertical = direction === 'up' || direction === 'down';
    
    opacity.value = withDelay(
      totalDelay,
      withTiming(1, { duration, easing: Easing.out(Easing.quad) })
    );
    
    translate.value = withDelay(
      totalDelay,
      withTiming(0, { duration, easing: Easing.out(Easing.quad) })
    );
  }, []);

  const isVertical = direction === 'up' || direction === 'down';

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: isVertical
      ? [{ translateY: translate.value }]
      : [{ translateX: translate.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

export default React.memo(StaggerItemInner);
