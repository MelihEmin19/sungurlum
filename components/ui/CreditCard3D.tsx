import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '@/constants/theme';
import { Icon } from './Icon';

interface CreditCard3DProps {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
  isFlipped: boolean;
}

const formatCardNumber = (number: string) => {
  const cleaned = number.replace(/\D/g, '');
  const chunks = cleaned.match(/.{1,4}/g);
  if (!chunks) return '**** **** **** ****';
  return chunks.join(' ');
};

export default function CreditCard3D({
  cardNumber,
  cardHolder,
  expiry,
  cvv,
  isFlipped,
}: CreditCard3DProps) {
  // Drive the rotation with a shared value
  const rotateY = useDerivedValue(() => {
    return withSpring(isFlipped ? 180 : 0, {
      damping: 15,
      stiffness: 120,
    });
  });

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(rotateY.value, [0, 180], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateValue}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(rotateY.value, [0, 180], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateValue}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  return (
    <View style={styles.container}>
      {/* Front of the Card */}
      <Animated.View style={[styles.card, styles.absoluteCard, frontAnimatedStyle]}>
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <Icon name="creditCard" size={24} color="#FFF" />
            <Text style={styles.brand}>SungurlumPay</Text>
          </View>
          
          <View style={styles.chipContainer}>
            <View style={styles.chip} />
            <View style={{ transform: [{ rotate: '90deg' }], opacity: 0.8 }}>
              <Icon name="wifi" size={20} color="#FFF" />
            </View>
          </View>

          <Text style={styles.cardNumber}>
            {cardNumber ? formatCardNumber(cardNumber) : '**** **** **** ****'}
          </Text>

          <View style={styles.footer}>
            <View>
              <Text style={styles.label}>KART SAHİBİ</Text>
              <Text style={styles.value} numberOfLines={1}>
                {cardHolder ? cardHolder.toUpperCase() : 'İSİM SOYİSİM'}
              </Text>
            </View>
            <View>
              <Text style={styles.label}>SKT</Text>
              <Text style={styles.value}>{expiry || 'AA/YY'}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Back of the Card */}
      <Animated.View style={[styles.card, styles.absoluteCard, backAnimatedStyle]}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.magneticStrip} />
          <View style={styles.cvvContainer}>
            <Text style={styles.label}>CVV</Text>
            <View style={styles.cvvStrip}>
              <Text style={styles.cvvText}>{cvv || '***'}</Text>
            </View>
          </View>
          <Text style={styles.disclaimer}>
            Bu kartın mülkiyeti bankanıza aittir. Güvenlik için arka yüzündeki numaranızı kimseyle paylaşmayınız.
          </Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1.586, // Standard credit card ratio
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  absoluteCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    color: '#FFF',
    fontSize: 16,
    ...Fonts.bold,
    fontStyle: 'italic',
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chip: {
    width: 40,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#FFD700',
    opacity: 0.8,
  },
  cardNumber: {
    color: '#FFF',
    fontSize: 22,
    ...Fonts.extraBold,
    letterSpacing: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    ...Fonts.bold,
    marginBottom: 2,
  },
  value: {
    color: '#FFF',
    fontSize: 14,
    ...Fonts.bold,
    maxWidth: 180,
  },
  magneticStrip: {
    height: 40,
    backgroundColor: '#000',
    marginHorizontal: -Spacing.xl,
    marginTop: Spacing.md,
  },
  cvvContainer: {
    marginTop: Spacing.md,
  },
  cvvStrip: {
    backgroundColor: '#FFF',
    height: 35,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: Spacing.md,
  },
  cvvText: {
    color: '#000',
    fontSize: 14,
    ...Fonts.bold,
    fontStyle: 'italic',
  },
  disclaimer: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 8,
    ...Fonts.medium,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
