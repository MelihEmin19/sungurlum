import React, { useEffect, useRef } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface TextRevealProps {
  text: string;
  style?: StyleProp<TextStyle>;
  highlightStyle?: StyleProp<TextStyle>;
  highlightWords?: string[];
  delayPerWord?: number;
  initialDelay?: number;
  duration?: number;
}

function AnimatedWord({ 
  word, 
  index, 
  delayPerWord, 
  initialDelay, 
  duration, 
  style,
  isHighlight,
  highlightStyle 
}: { 
  word: string; 
  index: number; 
  delayPerWord: number; 
  initialDelay: number; 
  duration: number; 
  style?: StyleProp<TextStyle>;
  isHighlight: boolean;
  highlightStyle?: StyleProp<TextStyle>;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    const delay = initialDelay + index * delayPerWord;
    opacity.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.cubic) }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text style={[style, isHighlight && highlightStyle, animatedStyle]}>
      {word}{' '}
    </Animated.Text>
  );
}

export default function TextReveal({
  text,
  style,
  highlightStyle,
  highlightWords = [],
  delayPerWord = 80,
  initialDelay = 200,
  duration = 400,
}: TextRevealProps) {
  const words = text.split(' ');

  return (
    <Animated.View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {words.map((word, index) => (
        <AnimatedWord
          key={`${word}-${index}`}
          word={word}
          index={index}
          delayPerWord={delayPerWord}
          initialDelay={initialDelay}
          duration={duration}
          style={style}
          isHighlight={highlightWords.some(hw => word.toLowerCase().includes(hw.toLowerCase()))}
          highlightStyle={highlightStyle}
        />
      ))}
    </Animated.View>
  );
}
