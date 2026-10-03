import React, { useEffect, useRef } from 'react';
import { StyleSheet, TextInput, TextInputProps, TextStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  useAnimatedStyle,
  withSequence,
} from 'react-native-reanimated';
import { Colors, Fonts } from '@/constants/theme';

Animated.addWhitelistedNativeProps({ text: true });
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedNumberProps extends Omit<TextInputProps, 'value'> {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
  delay?: number;
  countUp?: boolean;
}

export default function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  duration = 800,
  decimals = 0,
  delay = 0,
  countUp = true,
  style,
  ...props
}: AnimatedNumberProps) {
  const animatedValue = useSharedValue(countUp ? 0 : value);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (countUp) {
      // Count up from 0 with bounce
      animatedValue.value = withDelay(
        delay,
        withTiming(value, {
          duration,
          easing: Easing.out(Easing.cubic),
        })
      );
      // Subtle scale bounce when arriving
      scale.value = withDelay(
        delay + duration - 100,
        withSequence(
          withSpring(1.15, { damping: 8, stiffness: 400 }),
          withSpring(1, { damping: 12, stiffness: 200 })
        )
      );
    } else {
      animatedValue.value = withSpring(value, {
        damping: 20,
        stiffness: 150,
        mass: 0.5,
      });
    }
  }, [value]);

  const animatedProps = useAnimatedProps(() => {
    return {
      text: `${prefix}${animatedValue.value.toFixed(decimals)}${suffix}`,
    } as any;
  });

  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedScale}>
      <AnimatedTextInput
        underlineColorAndroid="transparent"
        editable={false}
        value={`${prefix}${value.toFixed(decimals)}${suffix}`}
        animatedProps={animatedProps}
        style={[styles.text, style]}
        {...props}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: Colors.text,
    padding: 0,
    margin: 0,
    ...Fonts.bold,
  },
});
