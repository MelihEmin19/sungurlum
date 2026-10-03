import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius, Shadows } from '@/constants/theme';
import SpringButton from '@/components/ui/SpringButton';
import { getClassifiedById, updateClassified, deleteClassified } from '@/services/classifieds';

export default function MyAdEditScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const ad = await getClassifiedById(id as string);
        if (ad) {
          setTitle(ad.title);
          setPrice(ad.price);
          setDescription(ad.description);
          setStatus(ad.status);
        } else {
          Alert.alert('Hata', 'İlan bulunamadı.');
          router.back();
        }
      } catch (error) {
        Alert.alert('Hata', 'İlan bilgileri alınamadı.');
      } finally {
        setLoading(false);
      }
    };
    fetchAd();
  }, [id]);

  const handleUpdate = async () => {
    if (!title || !price || !description) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    
    setSaving(true);
    try {
      await updateClassified(id as string, { title, price, description });
      Alert.alert('Başarılı', 'İlanınız güncellendi.', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Hata', 'Güncelleme sırasında bir sorun oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('İlanı Sil', 'Bu ilanı kalıcı olarak silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { 
        text: 'Sil', 
        style: 'destructive', 
        onPress: async () => {
          setSaving(true);
          try {
            await deleteClassified(id as string);
            Alert.alert('Başarılı', 'İlan silindi.');
            router.back();
          } catch (error) {
            Alert.alert('Hata', 'İlan silinirken bir sorun oluştu.');
            setSaving(false);
          }
        } 
      }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <SpringButton style={styles.iconButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </SpringButton>
        <Text style={styles.headerTitle}>İlanı Düzenle</Text>
        <SpringButton style={styles.iconButton} onPress={handleDelete}>
          <MaterialCommunityIcons name="trash-can-outline" size={24} color={Colors.error} />
        </SpringButton>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {status === 'pending' && (
          <View style={[styles.infoBox, { backgroundColor: Colors.warningLight }]}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={Colors.warning} />
            <Text style={[styles.infoText, { color: Colors.warning }]}>
              Bu ilan şu anda onay bekliyor. Yaptığınız değişiklikler onay sürecini etkilemez.
            </Text>
          </View>
        )}

        <Text style={styles.label}>İlan Başlığı</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Fiyat (₺)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>Açıklama</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <SpringButton 
          style={styles.updateButton} 
          onPress={handleUpdate}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.updateButtonText}>Değişiklikleri Kaydet</Text>
          )}
        </SpringButton>

        <View style={{ height: 40 }} />
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
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
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
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: FontSizes.sm,
    ...Fonts.medium,
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
    borderColor: Colors.borderLight,
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
  updateButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
    marginTop: Spacing.md,
  },
  updateButtonText: {
    fontSize: FontSizes.md,
    ...Fonts.bold,
    color: '#FFF',
  },
});
