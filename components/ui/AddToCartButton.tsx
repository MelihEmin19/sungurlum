import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import SpringButton from './SpringButton';
import { hapticSuccess } from '@/utils/haptics';

interface AddToCartButtonProps {
  onAdd: () => void;
  size?: number;
  color?: 'primary' | 'secondary' | 'marketGreen' | 'food';
}

export default function AddToCartButton({ onAdd, size = 32, color = 'primary' }: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (isAdded) {
      progress.value = withSpring(1, { damping: 12, stiffness: 100 });
      const timeout = setTimeout(() => {
        setIsAdded(false);
        progress.value = withTiming(0, { duration: 300 });
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isAdded]);

  const handlePress = () => {
    if (isAdded) return;
    hapticSuccess();
    setIsAdded(true);
    onAdd();
  };

  const plusStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 0.5], [1, 0]),
      transform: [
        { scale: interpolate(progress.value, [0, 0.5], [1, 0]) },
        { rotate: `${interpolate(progress.value, [0, 1], [0, 90])}deg` }
      ],
    };
  });

  const checkStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0.5, 1], [0, 1]),
      transform: [
        { scale: interpolate(progress.value, [0.5, 1], [0, 1]) },
      ],
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: progress.value > 0.5 ? Colors.success : Colors[color],
    };
  });

  return (
    <SpringButton onPress={handlePress} style={{ width: size, height: size }}>
      <Animated.View style={[styles.container, containerStyle, { borderRadius: size / 2 }]}>
        <Animated.View style={[styles.iconAbsolute, plusStyle]}>
          <MaterialCommunityIcons name="plus" size={size * 0.6} color="#FFF" />
        </Animated.View>
        <Animated.View style={[styles.iconAbsolute, checkStyle]}>
          <MaterialCommunityIcons name="check" size={size * 0.6} color="#FFF" />
        </Animated.View>
      </Animated.View>
    </SpringButton>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconAbsolute: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
