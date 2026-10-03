import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useAlertStore } from '@/stores/alertStore';

const { width } = Dimensions.get('window');

export function PremiumAlert() {
  const { visible, title, message, buttons, hideAlert } = useAlertStore();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);
  const translateY = useSharedValue(20);
  
  // Yerel state ile görünürlük (unmount kontrolü)
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 16, stiffness: 200, mass: 0.8 });
      translateY.value = withSpring(0, { damping: 16, stiffness: 200, mass: 0.8 });
    } else {
      opacity.value = withTiming(0, { duration: 250 }, (finished) => {
        if (finished) {
          runOnJS(setIsRendered)(false);
        }
      });
      scale.value = withTiming(0.9, { duration: 200 });
      translateY.value = withTiming(12, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }]
  }));

  const animatedOverlay = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  if (!isRendered) return null;

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <Animated.View style={[StyleSheet.absoluteFill, animatedOverlay]}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      </Animated.View>
      
      <Animated.View style={[styles.alertContainer, animatedStyle]}>
        {/* Inner glassmorphism layer */}
        <View style={styles.glassInner}>
          {/* Decorative glow */}
          <View style={styles.glowTop} />
          
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            {!!message && <Text style={styles.message}>{message}</Text>}
            
            <View style={styles.buttonContainer}>
              {buttons.map((btn, index) => (
                <Pressable
                  key={index}
                  style={({ pressed }) => [
                    styles.button,
                    btn.style === 'cancel' && styles.buttonCancel,
                    btn.style === 'destructive' && styles.buttonDestructive,
                    pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] }
                  ]}
                  onPress={() => {
                    hideAlert();
                    setTimeout(() => {
                      if (btn.onPress) btn.onPress();
                    }, 250);
                  }}
                >
                  <Text style={[
                    styles.buttonText,
                    btn.style === 'cancel' && styles.buttonTextCancel,
                    btn.style === 'destructive' && styles.buttonTextDestructive
                  ]}>
                    {btn.text || 'Tamam'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 9999,
    elevation: 9999,
  },
  alertContainer: {
    width: width * 0.85,
    maxWidth: 360,
    borderRadius: 28,
    overflow: 'hidden',
    // Outer shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
  glassInner: {
    backgroundColor: 'rgba(21, 24, 39, 0.85)', // Semi-transparent midnight
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 28,
    padding: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  glowTop: {
    position: 'absolute',
    top: -40,
    left: '20%',
    width: '60%',
    height: 80,
    borderRadius: 100,
    backgroundColor: 'rgba(56, 192, 188, 0.15)', // Turquoise glow
  },
  content: { alignItems: 'center' },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 23,
  },
  buttonContainer: { flexDirection: 'row', justifyContent: 'center', width: '100%', gap: 12 },
  button: {
    flex: 1,
    backgroundColor: '#38C0BC',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle inner glow
    shadowColor: '#38C0BC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonCancel: { 
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowOpacity: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  buttonDestructive: { 
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  buttonTextCancel: { color: 'rgba(255,255,255,0.85)' },
  buttonTextDestructive: { color: '#FFFFFF' }
});
