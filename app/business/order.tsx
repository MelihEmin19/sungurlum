import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius, Shadows } from '@/constants/theme';
import SpringButton from '@/components/ui/SpringButton';
import { MOCK_BUSINESSES } from '@/constants/mockData';

export default function OrderScreen() {
  const { businessId } = useLocalSearchParams<{ businessId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const business = MOCK_BUSINESSES.find(b => b.id === businessId);

  const [orderText, setOrderText] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const handleOrder = () => {
    if (!orderText || !address || !phone) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun.');
      return;
    }

    Alert.alert(
      'Siparişiniz Alındı!',
      'Kurye ekibimiz siparişinizi onaylamak için sizi birazdan arayacak.',
      [{ text: 'Tamam', onPress: () => router.back() }]
    );
  };

  if (!business) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>İşletme bulunamadı.</Text>
        <SpringButton onPress={() => router.back()}><Text>Geri</Text></SpringButton>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <SpringButton style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={24} color={Colors.text} />
        </SpringButton>
        <Text style={styles.headerTitle}>Bana Getir Siparişi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.infoBox}>
          <View style={styles.infoIcon}>
            <MaterialCommunityIcons name="moped" size={28} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Evinden Çıkma, Biz Getirelim!</Text>
            <Text style={styles.infoSubtitle}>
              <Text style={{...Fonts.bold}}>{business.name}</Text> işletmesinden ne almak istiyorsanız yazın, kapınıza getirelim.
            </Text>
          </View>
        </View>

        <Text style={styles.label}>Ne İstiyorsunuz?</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Örn: 2 ekmek, 1 kilo domates..."
          placeholderTextColor={Colors.textTertiary}
          multiline
          value={orderText}
          onChangeText={setOrderText}
        />

        <Text style={styles.label}>Teslimat Adresi</Text>
        <TextInput
          style={[styles.input, styles.textArea, { minHeight: 80 }]}
          placeholder="Açık adresinizi girin..."
          placeholderTextColor={Colors.textTertiary}
          multiline
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.label}>İletişim Numaranız</Text>
        <TextInput
          style={styles.input}
          placeholder="05XX XXX XX XX"
          placeholderTextColor={Colors.textTertiary}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <View style={styles.feeNotice}>
          <MaterialCommunityIcons name="information" size={16} color={Colors.textSecondary} />
          <Text style={styles.feeNoticeText}>
            Hizmet bedeli mesafeye göre değişmektedir. Müşteri temsilcimiz aradığında net fiyat verilecektir.
          </Text>
        </View>

        <SpringButton style={styles.submitButton} onPress={handleOrder}>
          <Text style={styles.submitButtonText}>Siparişi Gönder</Text>
          <MaterialCommunityIcons name="send" size={20} color="#FFF" />
        </SpringButton>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    ...Fonts.extraBold,
    color: Colors.text,
  },
  content: {
    padding: Spacing.xl,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    ...Shadows.sm,
  },
  infoTitle: {
    fontSize: FontSizes.md,
    ...Fonts.extraBold,
    color: Colors.primary,
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: FontSizes.sm,
    ...Fonts.medium,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  label: {
    fontSize: FontSizes.sm,
    ...Fonts.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    ...Fonts.medium,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  feeNotice: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  feeNoticeText: {
    flex: 1,
    fontSize: 11,
    ...Fonts.medium,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.md,
  },
  submitButtonText: {
    fontSize: FontSizes.md,
    ...Fonts.bold,
    color: '#FFF',
  },
});
