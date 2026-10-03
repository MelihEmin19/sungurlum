import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import { CATEGORIES, Category } from '@/constants/categories';
import SpringButton from '@/components/ui/SpringButton';
import StaggerItem from '@/components/ui/StaggerItem';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/theme';

interface CategoryGridProps {
  maxItems?: number;
}

// Map MaterialCommunityIcons names to Lucide names roughly
const ICON_MAP: Record<string, string> = {
  'home-outline': 'home',
  'silverware-fork-knife': 'utensils',
  'hospital-box-outline': 'hospital',
  'school-outline': 'graduationCap',
  'car-outline': 'car',
  'content-cut': 'scissors',
  'shopping-outline': 'shoppingBag',
  'laptop': 'laptop',
  'wrench-outline': 'wrench',
  'dots-horizontal': 'moreHorizontal',
};

const CategoryItem = React.memo(({ category, index, onPress }: { 
  category: Category; 
  index: number; 
  onPress: (slug: string) => void;
}) => {
  const lucideName = ICON_MAP[category.icon] || 'layoutGrid';

  return (
    <StaggerItem 
      index={index} 
      initialDelay={600} 
      delay={40} 
      direction="up" 
      distance={12}
      style={{ width: '22%', alignItems: 'center' }}
    >
      <SpringButton
        className="w-full items-center"
        scaleTo={0.92}
        onPress={() => onPress(category.slug)}
      >
        <View className="w-16 h-16 rounded-[18px] bg-surface items-center justify-center mb-2 border border-border/50">
          <Icon name={lucideName} size={26} color={Colors.primary} />
        </View>
        <Text className="text-[11px] font-semibold text-textSecondary text-center leading-4" numberOfLines={2}>
          {category.name}
        </Text>
      </SpringButton>
    </StaggerItem>
  );
});

export default function CategoryGrid({ maxItems }: CategoryGridProps) {
  const router = useRouter();
  
  const displayCategories = maxItems ? CATEGORIES.slice(0, maxItems - 1) : CATEGORIES;
  const hasMore = maxItems && CATEGORIES.length > maxItems - 1;

  const handleCategoryPress = useCallback((slug: string) => {
    router.push(`/category/${slug}` as any);
  }, [router]);

  return (
    <View className="mt-8 px-6">
      <StaggerItem index={0} initialDelay={550}>
        <View className="flex-row justify-between items-end mb-4">
          <Text className="text-[22px] font-extrabold text-textPrimary tracking-tight">Kategoriler</Text>
          {!maxItems && (
            <SpringButton scaleTo={0.9} onPress={() => router.push('/categories' as any)}>
              <Text className="text-base font-bold text-primary">Tümü</Text>
            </SpringButton>
          )}
        </View>
      </StaggerItem>

      <View className="flex-row flex-wrap justify-between gap-y-4">
        {displayCategories.map((category: Category, index) => (
          <CategoryItem key={category.id} category={category} index={index} onPress={handleCategoryPress} />
        ))}

        {hasMore && (
          <StaggerItem 
            index={displayCategories.length} 
            initialDelay={600} 
            delay={40}
            style={{ width: '22%', alignItems: 'center' }}
          >
            <SpringButton
              className="w-full items-center"
              scaleTo={0.9}
              onPress={() => router.push('/categories' as any)}
            >
              <View className="w-16 h-16 rounded-[18px] bg-surface items-center justify-center mb-2 border border-border/50">
                <Icon name="moreHorizontal" size={26} color={Colors.primary} />
              </View>
              <Text className="text-[11px] font-semibold text-textSecondary text-center leading-4" numberOfLines={2}>
                Daha Fazla
              </Text>
            </SpringButton>
          </StaggerItem>
        )}
      </View>
    </View>
  );
}
