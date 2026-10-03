import { withSpring, WithSpringConfig } from 'react-native-reanimated';

export const SpringConfig: WithSpringConfig = {
  damping: 20,
  stiffness: 200,
  mass: 1,
  overshootClamping: false,
};

export const Animation = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  spring: (value: number) => withSpring(value, SpringConfig as any),
};
