import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface SpringButtonProps extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  activeOpacity?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Lighter spring config — finishes faster, less CPU
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 300,
  overshootClamping: true,
  restDisplacementThreshold: 0.1,
  restSpeedThreshold: 5,
};

function SpringButtonInner({
  children,
  style,
  scaleTo = 0.95,
  activeOpacity = 0.85,
  onPressIn,
  onPressOut,
  onPress,
  ...props
}: SpringButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    scale.value = withSpring(scaleTo, SPRING_CONFIG);
    if (onPressIn) onPressIn(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, SPRING_CONFIG);
    if (onPressOut) onPressOut(e);
  };

  return (
    <AnimatedPressable
      style={[animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}

export default React.memo(SpringButtonInner);
