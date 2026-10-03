import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert, Linking, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import SpringButton from '@/components/ui/SpringButton';
import { Colors } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { db } from '@/config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ContactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWhatsApp = () => {
    // Geçici varsayılan numara
    const phoneNumber = '+905555555555';
    const text = 'Merhaba, Sungurlum uygulaması ile ilgili desteğe ihtiyacım var.';
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(text)}`).catch(() => {
      Alert.alert('Hata', 'WhatsApp cihazınızda yüklü değil veya açılamadı.');
    });
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen konu ve mesaj alanlarını doldurun.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'contact_messages'), {
        userId: user?.uid || 'guest',
        userName: user?.displayName || 'Misafir',
        userEmail: user?.email || '',
        subject: subject.trim(),
        message: message.trim(),
        createdAt: serverTimestamp(),
        status: 'new'
      });
      
      Alert.alert('Başarılı', 'Mesajınız başarıyla iletildi. En kısa sürede sizinle iletişime geçeceğiz.', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Hata', 'Mesajınız gönderilemedi. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View style={{ paddingTop: insets.top }} className="bg-surface border-b border-border/20 z-10">
          <View className="h-14 flex-row items-center px-4 justify-between">
            <SpringButton className="w-10 h-10 items-center justify-center rounded-full bg-background" onPress={() => router.back()}>
              <Icon name="arrowLeft" size={24} color="textPrimary" />
            </SpringButton>
            <Text className="text-lg font-extrabold text-textPrimary">İletişim & Destek</Text>
            <View className="w-10" />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          
          {/* Info Card */}
          <View className="bg-surface p-5 rounded-2xl border border-border/40 shadow-sm shadow-black/5 mb-6 items-center">
            <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Icon name="headset" size={32} color="primary" />
            </View>
            <Text className="text-xl font-extrabold text-textPrimary mb-2 text-center">Size Nasıl Yardımcı Olabiliriz?</Text>
            <Text className="text-sm font-medium text-textSecondary text-center leading-5">
              Uygulama ile ilgili talep, öneri (ürün/özellik isteği), şikayet veya esnaf işlemleri için bize ulaşabilirsiniz.
            </Text>
          </View>

          {/* WhatsApp Button */}
          <SpringButton 
            className="w-full bg-[#25D366] p-4 rounded-2xl flex-row items-center justify-center mb-8 shadow-sm shadow-[#25D366]/30"
            onPress={handleWhatsApp}
          >
            <Icon name="messageSquare" size={24} color="#FFFFFF" />
            <Text className="text-white font-bold text-base ml-3">WhatsApp ile Hızlı Destek</Text>
          </SpringButton>

          <View className="flex-row items-center mb-8">
            <View className="flex-1 h-[1px] bg-border" />
            <Text className="text-textTertiary font-medium px-4 text-xs">VEYA MESAJ GÖNDERİN</Text>
            <View className="flex-1 h-[1px] bg-border" />
          </View>

          {/* Form */}
          <View className="mb-4">
            <Text className="text-sm font-bold text-textPrimary mb-2">Konu</Text>
            <View className="bg-surface rounded-xl border border-border/50 px-4 h-12 justify-center shadow-sm shadow-black/5">
              <TextInput
                className="flex-1 text-base font-medium text-textPrimary"
                placeholder="Örn: Uygulamaya özellik eklensin, Siparişim..."
                placeholderTextColor={Colors.textTertiary}
                value={subject}
                onChangeText={setSubject}
              />
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-sm font-bold text-textPrimary mb-2">Mesajınız</Text>
            <View className="bg-surface rounded-xl border border-border/50 px-4 py-3 shadow-sm shadow-black/5">
              <TextInput
                className="text-base font-medium text-textPrimary min-h-[120px]"
                placeholder="Talebinizi, şikayetinizi veya önerinizi detaylıca yazabilirsiniz..."
                placeholderTextColor={Colors.textTertiary}
                multiline
                textAlignVertical="top"
                value={message}
                onChangeText={setMessage}
              />
            </View>
          </View>

          <SpringButton 
            className={`w-full h-14 rounded-2xl items-center justify-center shadow-lg ${!subject || !message || isSubmitting ? 'bg-border shadow-none' : 'bg-primary shadow-primary/30'}`}
            onPress={handleSubmit}
            disabled={!subject || !message || isSubmitting}
          >
            <Text className="text-white font-extrabold text-lg">
              {isSubmitting ? 'Gönderiliyor...' : 'Mesajı Gönder'}
            </Text>
          </SpringButton>

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
