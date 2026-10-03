import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, FontSizes, Fonts, Spacing } from '@/constants/theme';

interface RatingStarsProps {
  rating: number;
  size?: number;
  showValue?: boolean;
  reviewCount?: number;
}

export default function RatingStars({
  rating,
  size = 16,
  showValue = true,
  reviewCount,
}: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {Array.from({ length: fullStars }).map((_, i) => (
          <MaterialCommunityIcons key={`f-${i}`} name="star" size={size} color={Colors.star} />
        ))}
        {hasHalf && (
          <MaterialCommunityIcons name="star-half-full" size={size} color={Colors.star} />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <MaterialCommunityIcons key={`e-${i}`} name="star-outline" size={size} color={Colors.border} />
        ))}
      </View>
      {showValue && (
        <Text style={[styles.ratingValue, { fontSize: size - 2 }]}>
          {rating.toFixed(1)}
        </Text>
      )}
      {reviewCount !== undefined && (
        <Text style={[styles.reviewCount, { fontSize: size - 4 }]}>
          ({reviewCount} değerlendirme)
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
  ratingValue: {
    ...Fonts.bold,
    color: Colors.text,
    marginLeft: 4,
  },
  reviewCount: {
    color: Colors.textSecondary,
  },
});
