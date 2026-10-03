import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import SpringButton from '@/components/ui/SpringButton';

export default function CityPortalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <SpringButton 
          className="w-11 h-11 bg-surface rounded-full items-center justify-center shadow-sm shadow-black/5" 
          onPress={() => router.back()}
        >
          <Icon name="arrowLeft" size={24} color="textPrimary" />
        </SpringButton>
        <Text className="text-lg font-bold text-textPrimary">Şehir Portalı</Text>
        <View className="w-11" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        
        <View className="mb-8">
          <Text className="text-3xl font-extrabold text-textPrimary leading-[38px]">
            Sungurlu'da ne arıyorsun?
          </Text>
          <Text className="text-base text-textSecondary mt-2">
            Esnaf rehberini keşfedebilir veya ikinci el eşya ve iş ilanlarına göz atabilirsin.
          </Text>
        </View>

        {/* Esnaf Rehberi Büyük Kart */}
        <SpringButton 
          className="w-full rounded-3xl p-6 mb-5 overflow-hidden shadow-sm border border-border bg-surface"
          onPress={() => router.push('/categories' as any)}
          scaleTo={0.96}
        >
          <View className="absolute right-[-20px] bottom-[-20px] w-48 h-48 rounded-full" style={{ backgroundColor: 'rgba(56,192,188,0.06)' }} />
          
          <View className="w-14 h-14 rounded-full items-center justify-center bg-primary mb-4 shadow-lg shadow-primary/20">
            <Icon name="store" size={28} color="#FFFFFF" />
          </View>
          
          <Text className="text-[22px] font-extrabold text-textPrimary mb-1">Esnaf ve Hizmet Verenler</Text>
          <Text className="text-sm font-medium text-textSecondary leading-5">
            Elektrikçi, tesisatçı, temizlikçi, özel öğretmen ve tüm yerel hizmet verenler bir tık uzağında.
          </Text>
        </SpringButton>

        {/* İlanlar Büyük Kart */}
        <SpringButton 
          className="w-full rounded-3xl p-6 overflow-hidden shadow-sm border border-border bg-surface"
          onPress={() => router.push('/classifieds')}
          scaleTo={0.96}
        >
          <View className="absolute right-[-20px] bottom-[-20px] w-48 h-48 rounded-full" style={{ backgroundColor: 'rgba(255,138,61,0.06)' }} />
          
          <View className="w-14 h-14 rounded-full items-center justify-center mb-4 shadow-lg" style={{ backgroundColor: '#FF8A3D', shadowColor: 'rgba(255,138,61,0.2)' }}>
            <Icon name="tags" size={28} color="#FFFFFF" />
          </View>
          
          <Text className="text-[22px] font-extrabold text-textPrimary mb-1">Şehir İlanları</Text>
          <Text className="text-sm font-medium text-textSecondary leading-5">
            2.el eşya ilanları ve güncel iş ilanları burada.
          </Text>
        </SpringButton>

      </ScrollView>
    </View>
  );
}
