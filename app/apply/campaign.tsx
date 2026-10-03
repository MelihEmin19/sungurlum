import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpringButton from '@/components/ui/SpringButton';
import { useAuthStore } from '@/stores/authStore';
import { createCampaign } from '@/services/campaigns';
import { Icon } from '@/components/ui/Icon';

export default function ApplyCampaignScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    businessName: '',
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.businessName) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      await createCampaign({
        businessId: user?.uid || 'anonymous',
        businessName: formData.businessName,
        title: formData.title,
        description: formData.description,
        image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=800&auto=format&fit=crop', // Mock image
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      
      Alert.alert(
        'Başarılı',
        'Kampanya başvurunuz başarıyla alındı. Yönetici onayından sonra yayınlanacaktır.',
        [{ text: 'Tamam', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Hata', 'Başvuru sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: insets.top }} className="bg-surface border-b border-border/20 shadow-sm">
        <View className="h-14 flex-row items-center px-4 justify-between">
          <SpringButton 
            className="w-10 h-10 items-center justify-center rounded-full bg-background/80" 
            onPress={() => router.back()}
          >
            <Icon name="arrowLeft" size={24} color="textPrimary" />
          </SpringButton>
          <Text className="text-lg font-extrabold text-textPrimary">Kampanya Başvurusu</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        <View className="bg-primary/10 p-5 rounded-2xl mb-6 items-center border border-primary/20">
          <Icon name="megaphone" size={32} color="primary" />
          <Text className="text-lg font-bold text-primary mt-2 mb-1">Daha Çok Müşteriye Ulaşın!</Text>
          <Text className="text-sm font-medium text-textSecondary text-center">Uygulama ana sayfasında yer alacak bir kampanya veya duyuru oluşturabilirsiniz.</Text>
        </View>

        <View className="gap-5">
          <View className="gap-2">
            <Text className="text-sm font-bold text-textPrimary ml-1">İşletme Adınız</Text>
            <TextInput
              className="bg-surface border-[1.5px] border-border/50 rounded-xl px-4 py-4 text-base text-textPrimary font-medium"
              placeholder="Örn: Lezzet Dünyası"
              placeholderTextColor="#9CA3AF"
              value={formData.businessName}
              onChangeText={(t) => setFormData({ ...formData, businessName: t })}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-bold text-textPrimary ml-1">Kampanya Başlığı</Text>
            <TextInput
              className="bg-surface border-[1.5px] border-border/50 rounded-xl px-4 py-4 text-base text-textPrimary font-medium"
              placeholder="Örn: Tüm Tatlılarda %20 İndirim"
              placeholderTextColor="#9CA3AF"
              value={formData.title}
              onChangeText={(t) => setFormData({ ...formData, title: t })}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-bold text-textPrimary ml-1">Kampanya Detayları</Text>
            <TextInput
              className="bg-surface border-[1.5px] border-border/50 rounded-xl px-4 py-4 text-base text-textPrimary font-medium h-32"
              placeholder="Müşterilerinize kampanyanızın detaylarını anlatın..."
              placeholderTextColor="#9CA3AF"
              value={formData.description}
              onChangeText={(t) => setFormData({ ...formData, description: t })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <SpringButton 
            className={`bg-primary py-4 rounded-xl items-center mt-4 shadow-sm shadow-primary/30 ${loading ? 'opacity-70' : ''}`}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-white text-base font-bold">Başvuruyu Gönder</Text>
            )}
          </SpringButton>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
