import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import SpringButton from '@/components/ui/SpringButton';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius } from '@/constants/theme';
import { useAuthStore, SavedAddress } from '@/stores/authStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function AddressesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  
  const [addresses, setAddresses] = useState<SavedAddress[]>(user?.addresses || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.addresses) {
      setAddresses(user.addresses);
    }
  }, [user?.addresses]);

  const handleSaveAddress = async () => {
    if (!newTitle.trim() || !newAddress.trim()) {
      Alert.alert('Hata', 'Lütfen başlık ve açık adres bilgilerini doldurun.');
      return;
    }
    
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      const newAddr: SavedAddress = {
        id: Date.now().toString(),
        title: newTitle.trim(),
        address: newAddress.trim()
      };
      
      const updatedAddresses = [...addresses, newAddr];
      
      await updateDoc(doc(db, 'users', user.uid), {
        addresses: updatedAddresses
      });
      
      setAddresses(updatedAddresses);
      setUser({ ...user, addresses: updatedAddresses });
      setIsAdding(false);
      setNewTitle('');
      setNewAddress('');
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Hata', 'Adres kaydedilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!user) return;
    
    Alert.alert('Emin misiniz?', 'Bu adresi silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          const updatedAddresses = addresses.filter(a => a.id !== id);
          
          await updateDoc(doc(db, 'users', user.uid), {
            addresses: updatedAddresses
          });
          
          setAddresses(updatedAddresses);
          setUser({ ...user, addresses: updatedAddresses });
        } catch (error) {
          console.error('Error deleting address:', error);
          Alert.alert('Hata', 'Adres silinemedi.');
        }
      }}
    ]);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: Colors.background }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: insets.top, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, zIndex: 10 }}>
        <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, justifyContent: 'space-between' }}>
          <SpringButton style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Colors.background }} onPress={() => router.back()}>
            <Icon name="arrowLeft" size={24} color={Colors.text} />
          </SpringButton>
          <Text style={{ fontSize: FontSizes.lg, ...Fonts.extraBold, color: Colors.text }}>Adreslerim</Text>
          <SpringButton style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Colors.primaryLight }} onPress={() => setIsAdding(!isAdding)}>
            <Icon name={isAdding ? "x" : "plus"} size={20} color={Colors.primary} />
          </SpringButton>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}>
        
        {isAdding && (
          <View style={{ backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: Colors.borderLight }}>
            <Text style={{ fontSize: FontSizes.md, ...Fonts.bold, color: Colors.text, marginBottom: Spacing.md }}>Yeni Adres Ekle</Text>
            
            <Text style={{ fontSize: FontSizes.sm, ...Fonts.medium, color: Colors.textSecondary, marginBottom: Spacing.xs }}>Adres Başlığı (Örn: Ev, İş)</Text>
            <TextInput
              style={{ backgroundColor: Colors.background, borderRadius: BorderRadius.lg, padding: Spacing.md, fontSize: FontSizes.md, color: Colors.text, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight }}
              placeholder="Adres Başlığı"
              placeholderTextColor={Colors.textTertiary}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={{ fontSize: FontSizes.sm, ...Fonts.medium, color: Colors.textSecondary, marginBottom: Spacing.xs }}>Açık Adres</Text>
            <TextInput
              style={{ backgroundColor: Colors.background, borderRadius: BorderRadius.lg, padding: Spacing.md, fontSize: FontSizes.md, color: Colors.text, height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: Colors.borderLight }}
              placeholder="Mahalle, Sokak, No..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              value={newAddress}
              onChangeText={setNewAddress}
            />

            <SpringButton 
              style={{ backgroundColor: Colors.primary, height: 48, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.lg }}
              onPress={handleSaveAddress}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={{ color: '#FFF', fontSize: FontSizes.md, ...Fonts.bold }}>Kaydet</Text>
              )}
            </SpringButton>
          </View>
        )}

        {addresses.length === 0 && !isAdding ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 40 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight }}>
              <Icon name="mapPin" size={32} color={Colors.border} />
            </View>
            <Text style={{ fontSize: FontSizes.lg, ...Fonts.extraBold, color: Colors.text }}>Henüz Adresiniz Yok</Text>
            <Text style={{ fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm }}>Hızlı sipariş için adreslerinizi kaydedin.</Text>
            <SpringButton 
              style={{ backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.full, marginTop: Spacing.lg }}
              onPress={() => setIsAdding(true)}
            >
              <Text style={{ color: '#FFF', ...Fonts.bold }}>İlk Adresimi Ekle</Text>
            </SpringButton>
          </View>
        ) : (
          addresses.map(addr => (
            <View key={addr.id} style={{ backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.md, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: Colors.borderLight }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md }}>
                <Icon name={addr.title.toLowerCase().includes('ev') ? 'home' : addr.title.toLowerCase().includes('iş') ? 'briefcase' : 'mapPin'} size={24} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FontSizes.md, ...Fonts.bold, color: Colors.text, marginBottom: 2 }}>{addr.title}</Text>
                <Text style={{ fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 }}>{addr.address}</Text>
              </View>
              <SpringButton 
                style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Colors.errorLight }}
                onPress={() => handleDeleteAddress(addr.id)}
              >
                <Icon name="trash2" size={18} color={Colors.error} />
              </SpringButton>
            </View>
          ))
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
