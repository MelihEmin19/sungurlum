import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpringButton from '@/components/ui/SpringButton';
import { useAuthStore } from '@/stores/authStore';
import * as ImagePicker from 'expo-image-picker';
import { createClassifiedAd } from '@/services/classifieds';
import { uploadImageAsync } from '@/services/storage';
import { Icon } from '@/components/ui/Icon';

export default function CreateClassifiedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useAuthStore();

  const [category, setCategory] = useState<string | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [workplaceName, setWorkplaceName] = useState('');
  const [images, setImages] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePriceChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue) {
      const formatted = parseInt(numericValue, 10).toLocaleString('tr-TR');
      setPrice(formatted);
    } else {
      setPrice('');
    }
  };

  const pickImage = async () => {
    if (images.length >= 10) {
      Alert.alert('Sınır aşıldı', 'En fazla 10 fotoğraf ekleyebilirsiniz.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni vermeniz gerekmektedir.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 10 - images.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map(asset => asset.uri);
      setImages([...images, ...selectedUris]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!category) {
      Alert.alert('Hata', 'Lütfen bir ilan kategorisi seçin.');
      return;
    }

    // Validation based on category
    if (category === 'ikinci-el') {
      if (!title || !description || !price || !sellerPhone) {
        Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurunuz.');
        return;
      }
    } else if (category === 'is-ilanlari') {
      if (!title || !workplaceName || !description || !sellerPhone) {
        Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurunuz.');
        return;
      }
      if (user?.role !== 'business') {
        Alert.alert(
          'Esnaf Hesabı Gerekli',
          'İş ilanı verebilmek için sistemimizde onaylı bir Esnaf/İşletme hesabınızın olması gerekmektedir. Lütfen ana sayfadan Esnaf Başvurusu yapın.'
        );
        return;
      }
    }

    if (!user) {
      Alert.alert('Hata', 'İlan vermek için giriş yapmalısınız.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Upload images only for 'ikinci-el'
      const uploadedImageUrls = [];
      if (category === 'ikinci-el' && images.length > 0) {
        for (const uri of images) {
          const url = await uploadImageAsync(uri, 'classifieds');
          uploadedImageUrls.push(url);
        }
      }

      // Format description for job listings to include workplace name
      const finalDescription = category === 'is-ilanlari' 
        ? `İş Yeri: ${workplaceName}\n\nAranan Özellikler:\n${description}`
        : description;

      await createClassifiedAd({
        userId: user.uid,
        userName: user.displayName || 'Kullanıcı',
        title,
        description: finalDescription,
        price: category === 'is-ilanlari' ? 'Belirtilmedi' : price,
        category,
        images: uploadedImageUrls,
        sellerPhone
      });

      Alert.alert(
        'Başarılı', 
        'İlanınız incelendikten sonra yayına alınacaktır.',
        [{ text: 'Tamam', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Hata', 'İlan gönderilirken bir sorun oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CategorySelect = ({ id, name, icon }: { id: string, name: string, icon: string }) => {
    const isSelected = category === id;
    return (
      <SpringButton 
        className={`flex-1 flex-row items-center justify-center p-4 rounded-2xl border-2 transition-colors ${
          isSelected ? 'bg-primary/10 border-primary' : 'bg-surface border-border/40'
        }`}
        scaleTo={0.95}
        onPress={() => setCategory(id)}
      >
        <Icon name={icon} size={24} color={isSelected ? 'primary' : 'muted'} />
        <Text className={`ml-2 text-base font-bold ${isSelected ? 'text-primary' : 'text-textSecondary'}`}>
          {name}
        </Text>
      </SpringButton>
    );
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: insets.top }} className="bg-surface border-b border-border/20 shadow-sm">
        <View className="h-14 flex-row items-center px-4 justify-between">
          <SpringButton 
            className="w-10 h-10 items-center justify-center rounded-full bg-background/80" 
            onPress={() => router.back()}
          >
            <Icon name="x" size={24} color="textPrimary" />
          </SpringButton>
          <Text className="text-lg font-extrabold text-textPrimary">Yeni İlan Ver</Text>
          <View className="w-10" />
        </View>
      </View>

      {!isAuthenticated ? (
        <View className="flex-1 justify-center items-center p-8">
          <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-6">
            <Icon name="lock" size={40} color="primary" />
          </View>
          <Text className="text-xl font-extrabold text-textPrimary text-center mb-3">
            Giriş Yapmanız Gerekiyor
          </Text>
          <Text className="text-base text-textSecondary text-center font-medium mb-8 leading-6">
            İlan verebilmek için lütfen üye girişi yapın veya yeni hesap oluşturun.
          </Text>
          <SpringButton 
            className="w-full bg-primary py-4 rounded-xl items-center justify-center shadow-lg shadow-primary/30" 
            onPress={() => router.push('/auth/login')}
          >
            <Text className="text-white text-base font-bold">Giriş Yap / Kayıt Ol</Text>
          </SpringButton>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
          
          <Text className="text-sm font-bold text-textPrimary mb-3 uppercase tracking-wider">İlan Türü Seçin</Text>
          <View className="flex-row gap-3 mb-8">
            <CategorySelect id="ikinci-el" name="2. El Eşya" icon="sofa" />
            <CategorySelect id="is-ilanlari" name="İş İlanı" icon="briefcase" />
          </View>

          {category === 'ikinci-el' && (
            <View className="animate-fade-in">
              <View className="mb-6">
                {images.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                    {images.map((uri, index) => (
                      <View key={index} className="mr-3 relative">
                        <Image source={{ uri }} className="w-24 h-24 rounded-xl" />
                        <SpringButton 
                          className="absolute top-1.5 right-1.5 bg-black/60 w-6 h-6 rounded-full items-center justify-center backdrop-blur-md"
                          onPress={() => removeImage(index)}
                        >
                          <Icon name="x" size={14} color="#FFF" />
                        </SpringButton>
                      </View>
                    ))}
                  </ScrollView>
                )}
                {images.length < 10 && (
                  <SpringButton 
                    className="bg-primary/5 border-2 border-primary/20 border-dashed rounded-2xl items-center justify-center py-8"
                    onPress={pickImage}
                  >
                    <Icon name="camera" size={40} color="primary" />
                    <Text className="text-primary font-bold mt-3 text-base">Fotoğraf Ekle</Text>
                    <Text className="text-primary/70 font-medium text-xs mt-1">(En fazla 10 adet)</Text>
                  </SpringButton>
                )}
              </View>

              <Text className="text-sm font-bold text-textPrimary mb-2">İlan Başlığı</Text>
              <TextInput
                className="bg-surface border border-border/50 rounded-xl p-4 text-base font-medium text-textPrimary mb-5 shadow-sm shadow-black/5"
                placeholder="Örn: Sahibinden temiz kullanılmış..."
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
              />

              <Text className="text-sm font-bold text-textPrimary mb-2">Fiyat (₺)</Text>
              <TextInput
                className="bg-surface border border-border/50 rounded-xl p-4 text-base font-medium text-textPrimary mb-5 shadow-sm shadow-black/5"
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={price}
                onChangeText={handlePriceChange}
              />

              <Text className="text-sm font-bold text-textPrimary mb-2">İletişim Numarası</Text>
              <TextInput
                className="bg-surface border border-border/50 rounded-xl p-4 text-base font-medium text-textPrimary mb-5 shadow-sm shadow-black/5"
                placeholder="05XX XXX XX XX"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={sellerPhone}
                onChangeText={setSellerPhone}
              />

              <Text className="text-sm font-bold text-textPrimary mb-2">Açıklama</Text>
              <TextInput
                className="bg-surface border border-border/50 rounded-xl p-4 text-base font-medium text-textPrimary mb-6 shadow-sm shadow-black/5 min-h-[120px]"
                placeholder="İlanınız hakkında detaylı bilgi verin..."
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>
          )}

          {category === 'is-ilanlari' && (
            <View className="animate-fade-in">
              <Text className="text-sm font-bold text-textPrimary mb-2">İş Adı</Text>
              <TextInput
                className="bg-surface border border-border/50 rounded-xl p-4 text-base font-medium text-textPrimary mb-5 shadow-sm shadow-black/5"
                placeholder="Örn: Fırın Ustası Aranıyor"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
              />

              <Text className="text-sm font-bold text-textPrimary mb-2">İş Yeri Adı (Dükkan)</Text>
              <TextInput
                className="bg-surface border border-border/50 rounded-xl p-4 text-base font-medium text-textPrimary mb-5 shadow-sm shadow-black/5"
                placeholder="Örn: Merkez Kasap"
                placeholderTextColor="#94A3B8"
                value={workplaceName}
                onChangeText={setWorkplaceName}
              />

              <Text className="text-sm font-bold text-textPrimary mb-2">İletişim Numarası</Text>
              <TextInput
                className="bg-surface border border-border/50 rounded-xl p-4 text-base font-medium text-textPrimary mb-5 shadow-sm shadow-black/5"
                placeholder="05XX XXX XX XX"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={sellerPhone}
                onChangeText={setSellerPhone}
              />

              <Text className="text-sm font-bold text-textPrimary mb-2">Aranan Özellikler (Açıklama)</Text>
              <TextInput
                className="bg-surface border border-border/50 rounded-xl p-4 text-base font-medium text-textPrimary mb-6 shadow-sm shadow-black/5 min-h-[120px]"
                placeholder="Çalışma saatleri, aranan nitelikler, maaş vb. bilgileri yazın..."
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>
          )}

          {category && (
            <View className="animate-fade-in">
              <View className="flex-row items-start bg-info/10 p-4 rounded-xl mb-6">
                <Icon name="info" size={20} color="info" />
                <Text className="flex-1 ml-3 text-xs font-medium text-info leading-5">
                  İlanlar editör onayından geçtikten sonra yayına alınır. Topluluk kurallarına uymayan ilanlar reddedilir.
                </Text>
              </View>

              <SpringButton 
                className={`w-full py-4 rounded-xl items-center justify-center shadow-lg ${isSubmitting ? 'bg-primary/70' : 'bg-primary shadow-primary/30'}`}
                onPress={handlePublish}
                disabled={isSubmitting}
              >
                <Text className="text-white text-base font-bold">
                  {isSubmitting ? 'Gönderiliyor...' : 'İlanı Gönder'}
                </Text>
              </SpringButton>
            </View>
          )}

        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}
