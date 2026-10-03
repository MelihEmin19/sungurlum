import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Icon } from './Icon';
import SpringButton from './SpringButton';
import { Colors, Fonts } from '@/constants/theme';

interface EmptyStateProps {
  iconName?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'search' | 'favorite' | 'error';
}

const getVariantConfig = (variant: EmptyStateProps['variant']) => {
  switch (variant) {
    case 'search':
      return {
        icon: 'searchX',
        color: Colors.marketGreen,
        bgColor: Colors.marketGreenLight,
      };
    case 'favorite':
      return {
        icon: 'heartOff',
        color: Colors.favorite,
        bgColor: Colors.errorLight,
      };
    case 'error':
      return {
        icon: 'alertCircle',
        color: Colors.error,
        bgColor: Colors.errorLight,
      };
    default:
      return {
        icon: 'inbox',
        color: Colors.primary,
        bgColor: Colors.infoLight,
      };
  }
};

export default function EmptyState({
  iconName,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
}: EmptyStateProps) {
  const config = getVariantConfig(variant);
  const icon = iconName || config.icon;

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.iconContainer}>
        {/* Decorative background blob */}
        <View style={[styles.blob, { backgroundColor: config.bgColor }]} />
        <View style={[styles.blob2, { backgroundColor: config.bgColor, opacity: 0.5 }]} />
        <Icon name={icon as any} size={48} color={config.color} strokeWidth={1.5} />
      </Animated.View>

      <Animated.Text entering={FadeInUp.delay(200).duration(500)} style={styles.title}>
        {title}
      </Animated.Text>

      {description && (
        <Animated.Text entering={FadeInUp.delay(300).duration(500)} style={styles.description}>
          {description}
        </Animated.Text>
      )}

      {actionLabel && onAction && (
        <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.actionContainer}>
          <SpringButton style={styles.actionButton} onPress={onAction} scaleTo={0.95}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </SpringButton>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    width: 120,
    height: 120,
    position: 'relative',
  },
  blob: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    top: 15,
    right: 15,
  },
  blob2: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    bottom: 10,
    left: 20,
  },
  title: {
    ...Fonts.extraBold,
    fontSize: 22,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    ...Fonts.medium,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  actionContainer: {
    width: '100%',
    maxWidth: 240,
  },
  actionButton: {
    backgroundColor: Colors.secondary, // Midnight color for contrast
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionText: {
    ...Fonts.bold,
    color: '#FFFFFF',
    fontSize: 15,
  },
});
