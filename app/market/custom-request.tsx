import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import SpringButton from '@/components/ui/SpringButton';
import { Colors } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { createOrder } from '@/services/orders';

export default function CustomRequestScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [note, setNote] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const DELIVERY_FEE = 30; // Fixed fee for custom requests

  const handleSubmit = async () => {
    if (!note.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen ne istediğinizi yazın.');
      return;
    }
    if (!address.trim() || !phone.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen adres ve telefon bilgilerinizi eksiksiz girin.');
      return;
    }
    if (!user) {
      Alert.alert('Giriş Yapın', 'Sipariş vermek için üye girişi yapmalısınız.');
      router.push('/auth/login');
      return;
    }

    try {
      setIsSubmitting(true);
      await createOrder({
        userId: user.uid,
        userName: user.displayName || 'İsimsiz Kullanıcı',
        phone,
        address,
        type: 'custom',
        customNote: note,
        totalAmount: 0, // Unknown until courier buys it
        deliveryFee: DELIVERY_FEE,
        paymentMethod: 'cash',
        status: 'pending',
      });
      
      Alert.alert(
        'Sipariş Alındı!',
        'Özel isteğiniz kuryemize ulaştı. En kısa sürede temin edilip kapınıza getirilecektir.',
        [{ text: 'Tamam', onPress: () => router.push('/market' as any) }]
      );
    } catch (error) {
      Alert.alert('Hata', 'Siparişiniz oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-background"
    >
      <View style={{ paddingTop: insets.top }} className="bg-surface border-b border-border/20 z-10">
        <View className="h-14 flex-row items-center px-4 justify-between">
          <SpringButton className="w-10 h-10 items-center justify-center rounded-full bg-background" onPress={() => router.back()}>
            <Icon name="arrowLeft" size={24} color="textPrimary" />
          </SpringButton>
          <Text className="text-lg font-extrabold text-textPrimary">Benim İçin Al!</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* Info Card */}
        <View className="bg-warning/10 p-4 rounded-2xl border border-warning/20 mb-6 flex-row">
          <Icon name="info" size={24} color="warning" />
          <View className="flex-1 ml-3">
            <Text className="text-sm font-bold text-warning mb-1">Nasıl Çalışır?</Text>
            <Text className="text-xs text-warning/80 leading-5 font-medium">
              Kırtasiye, hırdavat veya dilediğiniz herhangi bir dükkandan alınacak eşyayı buraya yazın. Kuryemiz gidip sizin için alır ve fişiyle birlikte kapınıza getirir. Sadece fiş tutarı + ₺{DELIVERY_FEE} kurye ücreti ödersiniz.
            </Text>
          </View>
        </View>

        <Text className="text-sm font-bold text-textSecondary mb-2 ml-1">Ne İstiyorsunuz?</Text>
        <TextInput
          className="bg-surface p-4 rounded-2xl border border-border/40 text-base text-textPrimary h-32 mb-6"
          placeholder="Örn: Sanayideki Demir Hırdavat'tan 1 kutu 5'lik çivi ve 2 adet dübel alabilir misin?"
          placeholderTextColor="#94A3B8"
          multiline
          textAlignVertical="top"
          value={note}
          onChangeText={setNote}
        />

        <Text className="text-sm font-bold text-textSecondary mb-2 ml-1">Teslimat Adresi</Text>
        <TextInput
          className="bg-surface p-4 rounded-2xl border border-border/40 text-base text-textPrimary h-24 mb-6"
          placeholder="Açık adresinizi buraya yazın..."
          placeholderTextColor="#94A3B8"
          multiline
          textAlignVertical="top"
          value={address}
          onChangeText={setAddress}
        />

        <Text className="text-sm font-bold text-textSecondary mb-2 ml-1">Telefon Numarası</Text>
        <TextInput
          className="bg-surface p-4 rounded-2xl border border-border/40 text-base text-textPrimary mb-8"
          placeholder="05XX XXX XX XX"
          placeholderTextColor="#94A3B8"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

      </ScrollView>

      {/* Submit Button Bottom Sheet */}
      <View className="absolute bottom-0 left-0 right-0 p-5 bg-surface border-t border-border/20" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
        <View className="flex-row justify-between mb-4 px-1">
          <Text className="text-sm font-bold text-textSecondary">Kurye Hizmet Bedeli</Text>
          <Text className="text-sm font-extrabold text-textPrimary">₺{DELIVERY_FEE}</Text>
        </View>
        <SpringButton 
          className="w-full bg-warning h-14 rounded-2xl items-center justify-center shadow-lg shadow-warning/30"
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text className="text-white font-extrabold text-lg">
            {isSubmitting ? 'Gönderiliyor...' : 'İsteği Gönder'}
          </Text>
        </SpringButton>
      </View>
    </KeyboardAvoidingView>
  );
}
