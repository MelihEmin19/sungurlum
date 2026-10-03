import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import SpringButton from '@/components/ui/SpringButton';
import { Icon } from '@/components/ui/Icon';

export default function CityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();



  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }} className="px-5 pt-4 pb-3 bg-surface border-b border-border/20 shadow-sm">
        <Text className="text-3xl font-extrabold text-textPrimary tracking-tight">Şehir Portalı</Text>
        <Text className="text-sm font-medium text-textSecondary mt-1">Sungurlu Belediyesi Hizmetleri</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        
        <Text className="text-xl font-extrabold text-textPrimary mb-4">Günlük İhtiyaçlar</Text>
        <View className="flex-row flex-wrap justify-between gap-y-4">
          
          {/* Nöbetçi Eczaneler */}
          <SpringButton className="w-[47%] bg-surface p-5 rounded-2xl items-center border border-border/40 shadow-sm shadow-black/5" onPress={() => router.push('/pharmacies' as any)}>
            <View className="w-16 h-16 rounded-full bg-danger/10 items-center justify-center mb-4">
              <Icon name="pill" size={32} color="danger" />
            </View>
            <Text className="text-sm font-bold text-textPrimary text-center">Nöbetçi Eczane</Text>
            <Text className="text-[10px] font-medium text-textSecondary text-center mt-1">Acil Durum</Text>
          </SpringButton>
          {/* Vefat Haberleri */}
          <SpringButton className="w-[47%] bg-surface p-5 rounded-2xl items-center border border-border/40 shadow-sm shadow-black/5" onPress={() => router.push('/obituaries' as any)}>
            <View className="w-16 h-16 rounded-full bg-textPrimary/10 items-center justify-center mb-4">
              <Icon name="info" size={32} color="textPrimary" />
            </View>
            <Text className="text-sm font-bold text-textPrimary text-center">Vefat Haberleri</Text>
            <Text className="text-[10px] font-medium text-textSecondary text-center mt-1">Günlük Haberler</Text>
          </SpringButton>

          {/* Otobüs Saatleri */}
          <SpringButton className="w-[47%] bg-surface p-5 rounded-2xl items-center border border-border/40 shadow-sm shadow-black/5" onPress={() => router.push('/buses' as any)}>
            <View className="w-16 h-16 rounded-full bg-info/10 items-center justify-center mb-4">
              <Icon name="clock" size={32} color="info" />
            </View>
            <Text className="text-sm font-bold text-textPrimary text-center">Otobüsler</Text>
            <Text className="text-[10px] font-medium text-textSecondary text-center mt-1">Hat ve Saatler</Text>
          </SpringButton>



          {/* Şehir İlan Panosu (Classifieds) */}
          <SpringButton className="w-[47%] bg-surface p-5 rounded-2xl items-center border border-border/40 shadow-sm shadow-black/5" onPress={() => router.push('/classifieds' as any)}>
            <View className="w-16 h-16 rounded-full bg-success/10 items-center justify-center mb-4">
              <Icon name="clipboard" size={32} color="success" />
            </View>
            <Text className="text-sm font-bold text-textPrimary text-center">Şehir Panosu</Text>
            <Text className="text-[10px] font-medium text-textSecondary text-center mt-1">2. El ve İş İlanları</Text>
          </SpringButton>

        </View>



      </ScrollView>
    </View>
  );
}
