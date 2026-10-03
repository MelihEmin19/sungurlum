import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, Fonts, Shadows, BorderRadius } from '@/constants/theme';
import { submitApplication } from '@/services/applications';
import { useAuthStore } from '@/stores/authStore';

export default function BusinessApplicationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [formData, setFormData] = useState({
    businessType: 'service',
    businessName: '',
    ownerName: '',
    profession: '', // Serbest metin — admin kategorisini seçecek
    description: '',
    phone: '',
    whatsapp: '',
    address: '',
    minOrderAmount: '',
    deliveryTime: '',
  });

  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.businessName || !formData.ownerName || !formData.profession || !formData.phone || !formData.address) {
      Alert.alert('Eksik Bilgi', 'Lütfen zorunlu alanları doldurun.');
      return;
    }

    if (!user) {
      Alert.alert('Hata', 'Oturum süreniz dolmuş, lütfen tekrar giriş yapın.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitApplication({
        userId: user.uid,
        name: formData.businessName,
        description: formData.description,
        businessType: formData.businessType,
        category: formData.businessType === 'restaurant' ? 'Restoran / Paket Servis' : formData.profession,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        address: formData.address,
        minOrderAmount: formData.minOrderAmount,
        deliveryTime: formData.deliveryTime,
        selectedPackage: 'basic'
      });

      Alert.alert(
        'Başvuru Gönderildi ✅',
        'Başvurunuz incelenmek üzere gönderildi. Onaylandığında sizinle iletişime geçilecektir.',
        [{ text: 'Tamam', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Hata', 'Başvuru gönderilirken bir sorun oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Esnaf & Hizmet Veren</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <MaterialCommunityIcons name="information-outline" size={20} color={Colors.accent} />
            <Text style={styles.infoBannerText}>
              Başvurunuz uzman ekibimiz tarafından incelenecek ve onaylandıktan sonra
              uygulamada görünecektir. Kategori ataması sistem tarafından yapılacaktır.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>İşletme Bilgileri</Text>

            {/* Business Type */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                İşletme Türü <Text style={styles.required}>*</Text>
              </Text>
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                <TouchableOpacity 
                  style={{ flex: 1, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: formData.businessType === 'service' ? Colors.primary : Colors.border, backgroundColor: formData.businessType === 'service' ? Colors.primaryLight : Colors.surface, alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => updateField('businessType', 'service')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="storefront-outline" size={28} color={formData.businessType === 'service' ? Colors.primary : Colors.textTertiary} />
                  <Text style={{ fontSize: FontSizes.xs, ...Fonts.bold, color: formData.businessType === 'service' ? Colors.primary : Colors.textSecondary, marginTop: 8, textAlign: 'center' }}>Sadece Vitrin / Rehber</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ flex: 1, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: formData.businessType === 'restaurant' ? Colors.primary : Colors.border, backgroundColor: formData.businessType === 'restaurant' ? Colors.primaryLight : Colors.surface, alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => updateField('businessType', 'restaurant')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="silverware-fork-knife" size={28} color={formData.businessType === 'restaurant' ? Colors.primary : Colors.textTertiary} />
                  <Text style={{ fontSize: FontSizes.xs, ...Fonts.bold, color: formData.businessType === 'restaurant' ? Colors.primary : Colors.textSecondary, marginTop: 8, textAlign: 'center' }}>Restoran / Yemek</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.helperText}>Restoran seçeneği sipariş ve menü yönetimi panellerini açar.</Text>
            </View>

            {/* Business Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                İşletme / İsim <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="store-outline" size={20} color={Colors.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="Örn: Ali Usta Marangoz"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.businessName}
                  onChangeText={(v) => updateField('businessName', v)}
                />
              </View>
            </View>

            {/* Owner Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                İşletme Sahibi <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="account-outline" size={20} color={Colors.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="Ad Soyad"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.ownerName}
                  onChangeText={(v) => updateField('ownerName', v)}
                />
              </View>
            </View>

            {/* Profession / Service - Show only if service */}
            {formData.businessType === 'service' ? (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Meslek / Verdiğiniz Hizmet <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="briefcase-outline" size={20} color={Colors.textTertiary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Örn: Marangoz, Matematik Öğretmeni, Kasap..."
                    placeholderTextColor={Colors.textTertiary}
                    value={formData.profession}
                    onChangeText={(v) => updateField('profession', v)}
                  />
                </View>
                <Text style={styles.helperText}>
                  Mesleğinizi veya verdiğiniz hizmeti yazın. Kategoriniz uzman ekibimiz tarafından belirlenecektir.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>
                    Ortalama Teslimat Süresi (Dakika) <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="clock-outline" size={20} color={Colors.textTertiary} />
                    <TextInput
                      style={styles.input}
                      placeholder="Örn: 30-45"
                      placeholderTextColor={Colors.textTertiary}
                      value={formData.deliveryTime}
                      onChangeText={(v) => updateField('deliveryTime', v)}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>
                    Minimum Sipariş Tutarı (TL) <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="currency-try" size={20} color={Colors.textTertiary} />
                    <TextInput
                      style={styles.input}
                      placeholder="Örn: 150"
                      placeholderTextColor={Colors.textTertiary}
                      value={formData.minOrderAmount}
                      onChangeText={(v) => updateField('minOrderAmount', v)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </>
            )}

            {/* Description */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Açıklama</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="İşletmeniz hakkında kısa bir açıklama yazın..."
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.description}
                  onChangeText={(v) => updateField('description', v)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>İletişim Bilgileri</Text>

            {/* Phone */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Telefon Numarası <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="phone-outline" size={20} color={Colors.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="05XX XXX XX XX"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.phone}
                  onChangeText={(v) => updateField('phone', v)}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* WhatsApp */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>WhatsApp Numarası</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="whatsapp" size={20} color="#25D366" />
                <TextInput
                  style={styles.input}
                  placeholder="Aynı numara ise boş bırakın"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.whatsapp}
                  onChangeText={(v) => updateField('whatsapp', v)}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Address */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Adres <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <TextInput
                  style={[styles.input, styles.textAreaSmall]}
                  placeholder="Açık adres (Mahalle, Cadde/Sokak, No)"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.address}
                  onChangeText={(v) => updateField('address', v)}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Membership Info */}
          <View style={styles.membershipInfo}>
            <MaterialCommunityIcons name="shield-check-outline" size={24} color={Colors.primary} />
            <View style={styles.membershipTextContainer}>
              <Text style={styles.membershipTitle}>Üyelik Bilgisi</Text>
              <Text style={styles.membershipDescription}>
                Başvurunuz onaylandıktan sonra üyelik ücreti ve ödeme
                detayları hakkında sizinle iletişime geçilecektir.
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="send" size={20} color="#FFF" />
            <Text style={styles.submitButtonText}>Başvuru Gönder</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    ...Fonts.bold,
    color: Colors.text,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.accentLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    alignItems: 'flex-start',
  },
  infoBannerText: {
    fontSize: FontSizes.sm,
    color: Colors.accent,
    flex: 1,
    lineHeight: 20,
  },
  formSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    ...Fonts.bold,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  fieldGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.sm,
    ...Fonts.semiBold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  required: {
    color: Colors.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 50,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  textAreaWrapper: {
    height: 'auto' as any,
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
    paddingVertical: 0,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  textAreaSmall: {
    minHeight: 50,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: 4,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  membershipInfo: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  membershipTextContainer: {
    flex: 1,
  },
  membershipTitle: {
    fontSize: FontSizes.md,
    ...Fonts.bold,
    color: Colors.primaryDark,
    marginBottom: 4,
  },
  membershipDescription: {
    fontSize: FontSizes.sm,
    color: Colors.primaryDark,
    lineHeight: 20,
    opacity: 0.8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  submitButtonText: {
    fontSize: FontSizes.lg,
    ...Fonts.bold,
    color: '#FFF',
  },
  bottomSpacer: {
    height: 40,
  },
});
