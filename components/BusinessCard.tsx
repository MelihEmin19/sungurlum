import React from 'react';
import { View, Text } from 'react-native';
import { Business } from '@/constants/mockData';
import SpringButton from '@/components/ui/SpringButton';
import { useRouter } from 'expo-router';
import RatingStars from './RatingStars';
import { Icon } from '@/components/ui/Icon';

interface BusinessCardProps {
  business: Business;
  onPress?: () => void;
}

function BusinessCard({ business, onPress }: BusinessCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/business/${business.id}` as any);
    }
  };

  return (
    <SpringButton
      className="bg-surface rounded-2xl p-4 border border-border/20 flex-row"
      scaleTo={0.97}
      onPress={handlePress}
    >
      <View className="w-[84px] h-[84px] rounded-xl bg-background items-center justify-center relative overflow-hidden border border-border/30">
        <Icon name="store" size={32} color="muted" />
        
        {business.isFeatured && (
          <View className="absolute top-1 left-1 bg-warning px-1.5 py-0.5 rounded-md">
            <Text className="text-[8px] font-bold text-white">ÖNE ÇIKAN</Text>
          </View>
        )}
      </View>
      
      <View className="flex-1 ml-4 justify-between py-0.5">
        <View>
          <View className="flex-row justify-between items-start">
            <Text className="text-base font-bold text-textPrimary flex-1 mr-2" numberOfLines={1}>
              {business.name}
            </Text>
            {business.rating > 0 && (
              <View className="flex-row items-center bg-warning/10 px-1.5 py-0.5 rounded-md">
                <Icon name="star" size={12} color="warning" />
                <Text className="text-xs font-bold text-warning ml-1">{business.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
          
          <Text className="text-sm text-textSecondary font-medium mt-1" numberOfLines={1}>
            {business.category}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center flex-1 mr-4">
            <Icon name="mapPin" size={14} color="muted" />
            <Text className="text-xs text-muted ml-1" numberOfLines={1}>
              {business.address}
            </Text>
          </View>
          <View className="bg-primary/10 rounded-full w-8 h-8 items-center justify-center">
            <Icon name="arrowRight" size={16} color="primary" />
          </View>
        </View>
      </View>
    </SpringButton>
  );
}

export default React.memo(BusinessCard);

