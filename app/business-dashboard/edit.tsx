import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpringButton from '@/components/ui/SpringButton';
import { useAuthStore } from '@/stores/authStore';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { Icon } from '@/components/ui/Icon';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/theme';

export default function BusinessEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string>('');

  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [isPremium, setIsPremium] = useState<boolean>(false);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'businesses'), where('ownerId', '==', user.uid));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          const bizDoc = snap.docs[0];
          const biz = bizDoc.data();
          setBusinessId(bizDoc.id);
          setBusinessName(biz.name || 'İşletme');
          
          setPhone(biz.phone || '');
          setWhatsapp(biz.whatsapp || '');
          setAddress(biz.address || '');
          setDescription(biz.description || '');
          setWorkingHours(biz.workingHours || '');
          setCoverImage(biz.coverImage || null);
          setGallery(biz.gallery || []);
          setIsPremium(biz.isPremium || false);
        } else {
          Alert.alert('Hata', 'İşletme bilgileriniz bulunamadı.');
          router.back();
        }
      } catch (error) {
        Alert.alert('Hata', 'Bilgiler alınamadı.');
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [user]);

  const pickImage = async (type: 'cover' | 'gallery') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçebilmek için galeri iznine ihtiyacımız var.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: type === 'cover',
      aspect: type === 'cover' ? [16, 9] : undefined,
      quality: 0.8,
      allowsMultipleSelection: type === 'gallery',
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (type === 'cover') {
        setCoverImage(result.assets[0].uri);
      } else {
        const uris = result.assets.map(a => a.uri);
        setGallery(prev => [...prev, ...uris]);
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async (uri: string, path: string): Promise<string> => {
    if (uri.startsWith('http')) return uri;
    
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = uri.substring(uri.lastIndexOf('/') + 1);
    const storageRef = ref(storage, `${path}/${user?.uid}_${Date.now()}_${fileName}`);
    
    await uploadBytesResumable(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleSave = async () => {
    if (!businessId) return;

    if (!phone || !address || !description) {
      Alert.alert('Hata', 'Telefon, Adres ve Açıklama zorunludur.');
      return;
    }

    setSaving(true);
    try {
      let finalCoverImage = coverImage;
      if (coverImage && !coverImage.startsWith('http')) {
        finalCoverImage = await uploadImage(coverImage, 'business_covers');
      }

      const finalGallery = [];
      for (const uri of gallery) {
        if (!uri.startsWith('http')) {
          const uploadedUrl = await uploadImage(uri, 'business_gallery');
          finalGallery.push(uploadedUrl);
        } else {
          finalGallery.push(uri);
        }
      }

      await updateDoc(doc(db, 'businesses', businessId), {
        phone,
        whatsapp,
        address,
        description,
        workingHours,
        coverImage: finalCoverImage,
        gallery: finalGallery,
      });

      // Send admin notification
      await addDoc(collection(db, 'admin_notifications'), {
        type: 'business_update',
        businessId: businessId,
        businessName: businessName,
        message: 'İşletme bilgilerini ve/veya görsellerini güncelledi.',
        createdAt: serverTimestamp(),
        status: 'new'
      });
      
      Alert.alert('Başarılı', 'İşletme bilgileriniz ve görselleriniz başarıyla güncellendi.', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Güncelleme sırasında bir sorun oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: insets.top }} className="bg-surface border-b border-border/20 shadow-sm z-10">
        <View className="h-14 flex-row items-center px-4 justify-between">
          <SpringButton 
            className="w-10 h-10 items-center justify-center rounded-full bg-background/80" 
            onPress={() => router.back()}
          >
            <Icon name="arrowLeft" size={24} color="textPrimary" />
          </SpringButton>
          <Text className="text-lg font-extrabold text-textPrimary">Bilgi ve Görselleri Düzenle</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        <View className="flex-row bg-info/10 p-4 rounded-xl mb-6 items-center border border-info/20">
          <Icon name="info" size={24} color="info" />
          <Text className="flex-1 ml-3 text-sm font-medium text-info">
            Yaptığınız değişiklikler anında işletme profilinize yansıyacaktır. Lütfen görsellerinizin ve bilgilerinizin doğruluğundan emin olun. Sistem yöneticileri tarafından incelenecektir.
          </Text>
        </View>

        <Text className="text-lg font-extrabold text-textPrimary mb-4">Mağaza Görselleri</Text>
        
        <View className="mb-6">
          <Text className="text-sm font-bold text-textPrimary mb-2 ml-1">Kapak Fotoğrafı (Zorunlu)</Text>
          <SpringButton 
            className="w-full h-40 bg-surface rounded-2xl border-2 border-dashed border-border/60 items-center justify-center overflow-hidden"
            onPress={() => pickImage('cover')}
          >
            {coverImage ? (
              <>
                <Image source={{ uri: coverImage }} className="w-full h-full" resizeMode="cover" />
                <View className="absolute bg-black/50 px-3 py-1.5 rounded-full">
                  <Text className="text-white font-bold text-xs">Değiştir</Text>
                </View>
              </>
            ) : (
              <View className="items-center">
                <Icon name="image" size={32} color="textTertiary" />
                <Text className="text-sm font-medium text-textSecondary mt-2">Kapak Fotoğrafı Seç (16:9)</Text>
              </View>
            )}
          </SpringButton>
        </View>

        <View className="mb-8">
          <Text className="text-sm font-bold text-textPrimary mb-2 ml-1">Galeri Fotoğrafları (İsteğe Bağlı)</Text>
          <View className="flex-row flex-wrap gap-3">
            {gallery.map((uri, index) => (
              <View key={index} className="w-[30%] aspect-square rounded-xl overflow-hidden relative border border-border/30">
                <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
                <SpringButton 
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-danger/90 items-center justify-center"
                  onPress={() => removeGalleryImage(index)}
                >
                  <Icon name="x" size={14} color="#FFFFFF" />
                </SpringButton>
              </View>
            ))}
            {gallery.length < (isPremium ? 10 : 3) && (
              <SpringButton 
                className="w-[30%] aspect-square rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 items-center justify-center"
                onPress={() => pickImage('gallery')}
              >
                <Icon name="plus" size={24} color="primary" />
                <Text className="text-xs font-bold text-primary mt-1">Ekle</Text>
              </SpringButton>
            )}
            {!isPremium && gallery.length >= 3 && (
              <View className="w-full mt-2 bg-[#FEF3C7] p-3 rounded-xl border border-[#FDE68A] flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-secondary/20 items-center justify-center">
                  <Icon name="zap" size={16} color={Colors.secondary} />
                </View>
                <View className="flex-1 px-3">
                  <Text className="text-sm font-bold text-textPrimary">Premium Olun</Text>
                  <Text className="text-[11px] font-medium text-textSecondary leading-3 mt-0.5">Daha fazla müşteriye ulaşın</Text>
                </View>
                <SpringButton className="bg-secondary px-3 py-1.5 rounded-lg shadow-sm shadow-secondary/30" onPress={() => router.push('/apply/campaign' as any)}>
                  <Text className="text-white text-xs font-bold">Yükselt</Text>
                </SpringButton>
              </View>
            )}
          </View>
        </View>

        <Text className="text-lg font-extrabold text-textPrimary mb-4">İşletme Bilgileri</Text>

        <View className="gap-5">
          <View className="gap-2">
            <Text className="text-sm font-bold text-textPrimary ml-1">Telefon Numarası</Text>
            <TextInput
              className="bg-surface border-[1.5px] border-border/50 rounded-xl px-4 py-4 text-base text-textPrimary font-medium"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              placeholder="05XX XXX XX XX"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-bold text-textPrimary ml-1">WhatsApp Numarası (İsteğe Bağlı)</Text>
            <TextInput
              className="bg-surface border-[1.5px] border-border/50 rounded-xl px-4 py-4 text-base text-textPrimary font-medium"
              keyboardType="phone-pad"
              value={whatsapp}
              onChangeText={setWhatsapp}
              placeholder="05XX XXX XX XX"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-bold text-textPrimary ml-1">Çalışma Saatleri</Text>
            <TextInput
              className="bg-surface border-[1.5px] border-border/50 rounded-xl px-4 py-4 text-base text-textPrimary font-medium"
              value={workingHours}
              onChangeText={setWorkingHours}
              placeholder="Örn: Hafta içi 09:00 - 18:00"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-bold text-textPrimary ml-1">Adres</Text>
            <TextInput
              className="bg-surface border-[1.5px] border-border/50 rounded-xl px-4 py-4 text-base text-textPrimary font-medium h-24"
              multiline
              value={address}
              onChangeText={setAddress}
              placeholder="İşletmenizin tam adresi"
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-bold text-textPrimary ml-1">Hakkımızda / Açıklama</Text>
            <TextInput
              className="bg-surface border-[1.5px] border-border/50 rounded-xl px-4 py-4 text-base text-textPrimary font-medium h-32"
              multiline
              value={description}
              onChangeText={setDescription}
              placeholder="İşletmenizi detaylıca tanıtın..."
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
          </View>

          <SpringButton 
            className={`bg-primary h-14 rounded-2xl items-center justify-center mt-6 shadow-lg shadow-primary/30 ${saving ? 'opacity-70' : ''}`}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-white text-lg font-extrabold">Değişiklikleri Kaydet</Text>
            )}
          </SpringButton>
        </View>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
