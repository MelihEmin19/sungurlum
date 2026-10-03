import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius, Shadows } from '@/constants/theme';
import SpringButton from '@/components/ui/SpringButton';
import { addManualBusiness } from '@/services/businesses';
import { getCategories, addCategory } from '@/services/categories';
import { uploadImageAsync } from '@/services/storage';
import { Category } from '@/constants/categories';

export default function AddBusinessScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  
  // Yeni kategori ekleme stateleri
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  const [form, setForm] = useState({
    name: '',
    category: '',
    phone: '',
    address: '',
    description: '',
    coverImageUri: '' // Yerel resim URI'si için
  });

  // Kategorileri Yükle
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      console.log('Kategoriler çekilemedi');
    } finally {
      setFetchingCategories(false);
    }
  };

  // Yeni Kategori Ekleme
  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    setAddingCategory(true);
    try {
      const slugId = newCategoryName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
      const newCat: Category = {
        id: slugId,
        name: newCategoryName.trim(),
        icon: 'store', // Default icon
        color: '#38C0BC', // Default color
        order: categories.length + 1,
        slug: slugId,
        subcategories: []
      };
      
      await addCategory(newCat);
      setCategories([...categories, newCat]);
      setForm({ ...form, category: newCat.id });
      setShowNewCategoryInput(false);
      setNewCategoryName('');
      Alert.alert('Başarılı', 'Kategori eklendi ve seçildi.');
    } catch (error) {
      Alert.alert('Hata', 'Kategori eklenirken hata oluştu.');
    } finally {
      setAddingCategory(false);
    }
  };

  // Galeriden Resim Seçme
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('İzin Reddedildi', 'Galerinize erişmek için izne ihtiyacımız var.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      setForm({ ...form, coverImageUri: result.assets[0].uri });
    }
  };

  // İşletmeyi Kaydetme
  const handleSave = async () => {
    if (!form.name.trim() || !form.category || !form.address.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen İşletme Adı, Kategori ve Adres alanlarını doldurun.');
      return;
    }

    setLoading(true);
    try {
      let coverImageUrl = '';
      
      // Eğer galeriden resim seçildiyse Firebase Storage'a yükle
      if (form.coverImageUri) {
        coverImageUrl = await uploadImageAsync(form.coverImageUri, 'businesses/covers');
      } else {
        // Default kapak resmi ataması (seçilmediyse)
        if (form.category === 'health') coverImageUrl = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&auto=format&fit=crop&q=60';
        else if (form.category === 'public') coverImageUrl = 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=500&auto=format&fit=crop&q=60';
        else if (form.category === 'religion') coverImageUrl = 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=500&auto=format&fit=crop&q=60';
        else coverImageUrl = 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=500&auto=format&fit=crop&q=60';
      }

      await addManualBusiness({
        name: form.name.trim(),
        category: form.category,
        subcategory: form.category,
        phone: form.phone.trim(),
        whatsapp: form.phone.trim(),
        address: form.address.trim(),
        description: form.description.trim() || `${form.name} işletmesi.`,
        coverImage: coverImageUrl,
        isPublicPlace: ['public', 'health', 'education', 'religion'].includes(form.category)
      });

      Alert.alert('Başarılı', 'İşletme/Kurum başarıyla eklendi.', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Hata', 'Kayıt sırasında bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <SpringButton style={styles.iconButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </SpringButton>
        <Text style={styles.headerTitle}>Kurum / İşletme Ekle</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information" size={24} color={Colors.info} />
          <Text style={styles.infoText}>
            Buradan eklediğiniz işletme veya kurumlar uygulamanın Şehir Portalı veya Esnaf listesinde anında yayınlanacaktır.
          </Text>
        </View>

        {/* Kurum Adı */}
        <Text style={styles.label}>Kurum / İşletme Adı <Text style={{color: Colors.error}}>*</Text></Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="store-outline" size={22} color={Colors.textTertiary} style={styles.inputIcon} />
          <TextInput 
            style={styles.input}
            placeholder="Örn: Sungurlu Devlet Hastanesi, Ahmet Usta"
            placeholderTextColor={Colors.textTertiary}
            value={form.name}
            onChangeText={(text) => setForm({...form, name: text})}
          />
        </View>

        {/* Kategori Seçimi */}
        <Text style={styles.label}>Kategori <Text style={{color: Colors.error}}>*</Text></Text>
        {fetchingCategories ? (
          <ActivityIndicator color={Colors.primary} style={{ alignSelf: 'flex-start', marginVertical: 10 }} />
        ) : (
          <View style={styles.categoriesContainer}>
            {categories.map((cat) => {
              const isSelected = form.category === cat.id;
              return (
                <SpringButton 
                  key={cat.id} 
                  style={[styles.categoryBtn, isSelected && styles.categoryBtnActive]}
                  onPress={() => setForm({...form, category: cat.id})}
                >
                  <MaterialCommunityIcons name={cat.icon as any} size={20} color={isSelected ? '#FFF' : Colors.textSecondary} />
                  <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>{cat.name}</Text>
                </SpringButton>
              );
            })}
            
            {/* Yeni Kategori Butonu */}
            <SpringButton 
              style={[styles.categoryBtn, { backgroundColor: Colors.info + '15', borderColor: Colors.info + '30', borderStyle: 'dashed' }]}
              onPress={() => setShowNewCategoryInput(!showNewCategoryInput)}
            >
              <MaterialCommunityIcons name="plus" size={20} color={Colors.info} />
              <Text style={[styles.categoryText, { color: Colors.info }]}>Yeni Kategori Oluştur</Text>
            </SpringButton>
          </View>
        )}

        {/* Yeni Kategori Input Alanı */}
        {showNewCategoryInput && (
          <View style={styles.newCategoryBox}>
            <TextInput 
              style={styles.newCategoryInput}
              placeholder="Yeni Kategori Adı"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <TouchableOpacity 
              style={[styles.newCategoryBtn, !newCategoryName.trim() && { opacity: 0.5 }]} 
              onPress={handleAddNewCategory}
              disabled={addingCategory || !newCategoryName.trim()}
            >
              {addingCategory ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.newCategoryBtnText}>Ekle</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* Resim Yükleme (Galeri) */}
        <Text style={styles.label}>Kapak Fotoğrafı (Opsiyonel)</Text>
        <TouchableOpacity style={styles.imageUploadContainer} onPress={pickImage} activeOpacity={0.8}>
          {form.coverImageUri ? (
            <>
              <Image source={{ uri: form.coverImageUri }} style={styles.uploadedImage} />
              <View style={styles.imageOverlay}>
                <MaterialCommunityIcons name="camera-retake" size={24} color="#FFF" />
                <Text style={styles.imageOverlayText}>Değiştir</Text>
              </View>
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="image-plus" size={40} color={Colors.primary} />
              <Text style={styles.imagePlaceholderText}>Galeriden Fotoğraf Seç</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Telefon */}
        <Text style={styles.label}>İletişim Numarası</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="phone-outline" size={22} color={Colors.textTertiary} style={styles.inputIcon} />
          <TextInput 
            style={styles.input}
            placeholder="0364 311 00 00 (İsteğe bağlı)"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(text) => setForm({...form, phone: text})}
          />
        </View>

        {/* Adres */}
        <Text style={styles.label}>Açık Adres <Text style={{color: Colors.error}}>*</Text></Text>
        <View style={[styles.inputContainer, { height: 80, alignItems: 'flex-start' }]}>
          <MaterialCommunityIcons name="map-marker-outline" size={22} color={Colors.textTertiary} style={[styles.inputIcon, { marginTop: 12 }]} />
          <TextInput 
            style={[styles.input, { height: 80, paddingTop: 12, textAlignVertical: 'top' }]}
            placeholder="Açık adresi buraya girin..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            value={form.address}
            onChangeText={(text) => setForm({...form, address: text})}
          />
        </View>

        {/* Açıklama */}
        <Text style={styles.label}>Kısa Açıklama / Hakkında</Text>
        <View style={[styles.inputContainer, { height: 80, alignItems: 'flex-start' }]}>
          <MaterialCommunityIcons name="text" size={22} color={Colors.textTertiary} style={[styles.inputIcon, { marginTop: 12 }]} />
          <TextInput 
            style={[styles.input, { height: 80, paddingTop: 12, textAlignVertical: 'top' }]}
            placeholder="Kurum hakkında kısa bilgi verebilirsiniz..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            value={form.description}
            onChangeText={(text) => setForm({...form, description: text})}
          />
        </View>

        <View style={{ height: 40 }} />

        <SpringButton 
          style={[styles.saveButton, (!form.name || !form.category || !form.address || loading) && { opacity: 0.5 }]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="check-circle" size={22} color="#FFF" />
              <Text style={styles.saveButtonText}>Kaydet ve Yayımla</Text>
            </>
          )}
        </SpringButton>
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, backgroundColor: Colors.surface },
  iconButton: { width: 44, height: 44, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.lg, ...Fonts.extraBold, color: Colors.text },
  content: { padding: Spacing.xl },
  infoBox: { flexDirection: 'row', backgroundColor: Colors.info + '10', padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.xxl, borderWidth: 1, borderColor: Colors.info + '30', gap: Spacing.md, alignItems: 'center' },
  infoText: { flex: 1, fontSize: FontSizes.sm, color: Colors.info, ...Fonts.medium, lineHeight: 20 },
  label: { fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.textSecondary, marginBottom: 8, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg, paddingHorizontal: Spacing.md, height: 52 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: FontSizes.md, color: Colors.text, ...Fonts.medium, height: '100%' },
  
  categoriesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Spacing.xl },
  categoryBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, paddingVertical: 10, paddingHorizontal: 14, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.borderLight, gap: 6 },
  categoryBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryText: { fontSize: 13, ...Fonts.bold, color: Colors.textSecondary },
  categoryTextActive: { color: '#FFF' },
  
  newCategoryBox: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl, gap: 10 },
  newCategoryInput: { flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.info, borderRadius: BorderRadius.lg, paddingHorizontal: 16, height: 44, fontSize: FontSizes.sm, ...Fonts.medium, color: Colors.text },
  newCategoryBtn: { backgroundColor: Colors.info, height: 44, paddingHorizontal: 20, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  newCategoryBtnText: { color: '#FFF', ...Fonts.bold, fontSize: FontSizes.sm },

  imageUploadContainer: { width: '100%', height: 160, backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.xl, overflow: 'hidden', marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.primary + '30', borderStyle: 'dashed' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  imagePlaceholderText: { fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.primary },
  uploadedImage: { width: '100%', height: '100%' },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  imageOverlayText: { color: '#FFF', ...Fonts.bold, fontSize: FontSizes.md },

  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, height: 56, borderRadius: BorderRadius.lg, gap: 10, ...Shadows.md },
  saveButtonText: { color: '#FFF', fontSize: FontSizes.md, ...Fonts.extraBold },
});
