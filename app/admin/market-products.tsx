import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TextInput, Modal, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import SpringButton from '@/components/ui/SpringButton';
import { Colors, Spacing, FontSizes, Fonts } from '@/constants/theme';
import { getProducts, addProduct, updateProduct, deleteProduct, Product } from '@/services/products';

export default function AdminMarketProducts() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    isAvailable: true
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const data = await getProducts('market', 'admin');
      setProducts(data);
    } catch (e) {
      Alert.alert('Hata', 'Ürünler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun.');
      return;
    }
    
    try {
      if (editingId) {
        await updateProduct(editingId, formData);
      } else {
        await addProduct({
          ...formData as any,
          type: 'market',
          businessId: 'admin'
        });
      }
      setModalVisible(false);
      fetchProducts();
    } catch (e) {
      Alert.alert('Hata', 'Ürün kaydedilemedi.');
    }
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setEditingId(product.id || null);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Emin misiniz?', 'Bu ürünü silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          await deleteProduct(id);
          fetchProducts();
        } catch (e) {
          Alert.alert('Hata', 'Ürün silinemedi.');
        }
      }}
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
        <SpringButton onPress={() => router.back()} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="arrowLeft" size={24} color={Colors.text} />
        </SpringButton>
        <Text style={{ fontSize: FontSizes.lg, ...Fonts.extraBold, color: Colors.text }}>Market Ürünleri</Text>
        <SpringButton 
          onPress={() => { setFormData({ name: '', description: '', price: 0, category: '', isAvailable: true }); setEditingId(null); setModalVisible(true); }}
          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight, borderRadius: 20 }}
        >
          <Icon name="plus" size={24} color={Colors.primary} />
        </SpringButton>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
        {products.map(product => (
          <View key={product.id} style={{ backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: 12, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FontSizes.md, ...Fonts.bold, color: Colors.text }}>{product.name}</Text>
                <Text style={{ fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: 4 }}>{product.category}</Text>
                <Text style={{ fontSize: FontSizes.lg, ...Fonts.extraBold, color: Colors.primary }}>₺{product.price}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <SpringButton onPress={() => handleEdit(product)} style={{ padding: 8, backgroundColor: Colors.info + '20', borderRadius: 8 }}>
                  <Icon name="pencil" size={20} color={Colors.info} />
                </SpringButton>
                <SpringButton onPress={() => handleDelete(product.id!)} style={{ padding: 8, backgroundColor: Colors.error + '20', borderRadius: 8 }}>
                  <Icon name="trash" size={20} color={Colors.error} />
                </SpringButton>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: product.isAvailable ? Colors.success : Colors.error, marginRight: 8 }} />
              <Text style={{ fontSize: FontSizes.sm, ...Fonts.medium, color: product.isAvailable ? Colors.success : Colors.error }}>
                {product.isAvailable ? 'Stokta Var' : 'Tükendi'}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: Colors.background, padding: Spacing.xl, paddingTop: 40 }}>
          <Text style={{ fontSize: FontSizes.xl, ...Fonts.bold, marginBottom: Spacing.xl }}>{editingId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</Text>
          
          <Text style={{ marginBottom: 4, ...Fonts.bold }}>Ürün Adı</Text>
          <TextInput 
            style={{ backgroundColor: Colors.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 }}
            value={formData.name}
            onChangeText={t => setFormData({...formData, name: t})}
          />

          <Text style={{ marginBottom: 4, ...Fonts.bold }}>Kategori</Text>
          <TextInput 
            style={{ backgroundColor: Colors.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 }}
            value={formData.category}
            onChangeText={t => setFormData({...formData, category: t})}
            placeholder="Örn: Atıştırmalık"
          />

          <Text style={{ marginBottom: 4, ...Fonts.bold }}>Fiyat (TL)</Text>
          <TextInput 
            style={{ backgroundColor: Colors.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 }}
            value={formData.price?.toString()}
            onChangeText={t => setFormData({...formData, price: parseFloat(t) || 0})}
            keyboardType="numeric"
          />

          <Text style={{ marginBottom: 4, ...Fonts.bold }}>Açıklama</Text>
          <TextInput 
            style={{ backgroundColor: Colors.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, marginBottom: 16, height: 80 }}
            value={formData.description}
            onChangeText={t => setFormData({...formData, description: t})}
            multiline
          />

          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}
            onPress={() => setFormData({...formData, isAvailable: !formData.isAvailable})}
          >
            <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: formData.isAvailable ? Colors.primary : Colors.textTertiary, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: formData.isAvailable ? Colors.primary : 'transparent' }}>
              {formData.isAvailable && <Icon name="check" size={16} color="#FFF" />}
            </View>
            <Text style={{ fontSize: FontSizes.md, ...Fonts.bold }}>Stokta Var</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <SpringButton 
              style={{ flex: 1, padding: 16, backgroundColor: Colors.surface, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ ...Fonts.bold, color: Colors.text }}>İptal</Text>
            </SpringButton>
            <SpringButton 
              style={{ flex: 1, padding: 16, backgroundColor: Colors.primary, borderRadius: 12, alignItems: 'center' }}
              onPress={handleSave}
            >
              <Text style={{ ...Fonts.bold, color: '#FFF' }}>Kaydet</Text>
            </SpringButton>
          </View>
        </View>
      </Modal>
    </View>
  );
}
