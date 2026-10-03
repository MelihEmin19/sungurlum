import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import SpringButton from '@/components/ui/SpringButton';
import { Icon } from '@/components/ui/Icon';

export default function BusesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }} className="h-24 bg-surface flex-row items-center px-4 border-b border-border/20 shadow-sm">
        <SpringButton 
          className="w-10 h-10 items-center justify-center rounded-full bg-background/80" 
          onPress={() => router.back()}
        >
          <Icon name="arrowLeft" size={24} color="textPrimary" />
        </SpringButton>
        <Text className="text-lg font-extrabold text-textPrimary ml-4">Otobüs Saatleri</Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View className="w-24 h-24 rounded-full bg-info/10 items-center justify-center mb-6">
          <Icon name="clock" size={48} color="info" />
        </View>
        <Text className="text-2xl font-extrabold text-textPrimary text-center mb-2">Çok Yakında</Text>
        <Text className="text-base font-medium text-textSecondary text-center leading-6">
          Belediye otobüs güzergahları ve güncel hareket saatleri çok yakında bu ekranda yer alacaktır.
        </Text>
        
        <SpringButton 
          className="mt-8 bg-surface border border-border px-8 py-3 rounded-xl shadow-sm"
          onPress={() => router.back()}
        >
          <Text className="text-sm font-bold text-textPrimary">Geri Dön</Text>
        </SpringButton>
      </ScrollView>
    </View>
  );
}
