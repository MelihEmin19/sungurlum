import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius, Shadows } from '@/constants/theme';
import SpringButton from '@/components/ui/SpringButton';
import { getCategories, addCategory, updateCategory, deleteCategory } from '@/services/categories';
import { Category } from '@/constants/categories';

export default function AdminCategoriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [form, setForm] = useState({
    id: '',
    name: '',
    icon: 'store',
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setForm({ id: '', name: '', icon: 'store' });
    setModalVisible(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setIsEditing(true);
    setForm({ id: cat.id, name: cat.name, icon: cat.icon as string });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.icon.trim()) {
      Alert.alert('Hata', 'Kategori adı ve ikonu boş bırakılamaz.');
      return;
    }

    try {
      if (isEditing) {
        await updateCategory(form.id, {
          name: form.name,
          icon: form.icon
        });
        Alert.alert('Başarılı', 'Kategori güncellendi.');
      } else {
        const newSlug = form.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const newCat: Category = {
          id: newSlug,
          name: form.name,
          slug: newSlug,
          icon: form.icon,
          color: Colors.primary,
          order: categories.length + 1,
          subcategories: []
        };
        await addCategory(newCat);
        Alert.alert('Başarılı', 'Yeni kategori eklendi.');
      }
      setModalVisible(false);
      fetchCategories();
    } catch (error) {
      Alert.alert('Hata', 'İşlem başarısız oldu.');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Uyarı', 'Bu kategoriyi kalıcı olarak silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          await deleteCategory(id);
          fetchCategories();
        } catch (e) {
          Alert.alert('Hata', 'Silinemedi.');
        }
      }}
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <SpringButton style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </SpringButton>
        <Text style={styles.headerTitle}>Kategori Yönetimi</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SpringButton style={styles.addBtn} onPress={handleOpenAdd}>
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
          <Text style={styles.addBtnText}>Yeni Kategori Ekle</Text>
        </SpringButton>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          categories.map((c) => (
            <View key={c.id} style={styles.card}>
              <View style={styles.cardInfo}>
                <View style={[styles.iconWrapper, { backgroundColor: c.color + '15' }]}>
                  <MaterialCommunityIcons name={c.icon as any} size={24} color={c.color || Colors.primary} />
                </View>
                <View>
                  <Text style={styles.catName}>{c.name}</Text>
                  <Text style={styles.catSlug}>{c.slug}</Text>
                </View>
              </View>
              
              <View style={styles.actions}>
                <TouchableOpacity style={styles.btnEdit} onPress={() => handleOpenEdit(c)}>
                  <MaterialCommunityIcons name="pencil" size={20} color={Colors.info} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(c.id)}>
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? 'Kategori Düzenle' : 'Yeni Kategori'}</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Kategori Adı</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Eczane, Çiçekçi..."
                value={form.name}
                onChangeText={(t) => setForm({...form, name: t})}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>İkon (MaterialCommunityIcons)</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: store, pill, flower..."
                value={form.icon}
                onChangeText={(t) => setForm({...form, icon: t})}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalActions}>
              <SpringButton style={[styles.modalBtn, { backgroundColor: Colors.surface }]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalBtnText, { color: Colors.text }]}>İptal</Text>
              </SpringButton>
              <SpringButton style={[styles.modalBtn, { backgroundColor: Colors.primary }]} onPress={handleSave}>
                <Text style={styles.modalBtnText}>Kaydet</Text>
              </SpringButton>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backButton: { width: 44, height: 44, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.lg, ...Fonts.extraBold, color: Colors.text },
  content: { padding: Spacing.xl },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.success, padding: Spacing.md, borderRadius: BorderRadius.lg, gap: Spacing.sm, marginBottom: Spacing.xl },
  addBtnText: { color: '#FFF', ...Fonts.bold, fontSize: FontSizes.md },
  
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.sm },
  cardInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconWrapper: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  catName: { fontSize: FontSizes.md, ...Fonts.bold, color: Colors.text },
  catSlug: { fontSize: FontSizes.xs, ...Fonts.medium, color: Colors.textTertiary },
  
  actions: { flexDirection: 'row', gap: Spacing.sm },
  btnEdit: { padding: 10, backgroundColor: Colors.infoLight, borderRadius: BorderRadius.md },
  btnDelete: { padding: 10, backgroundColor: Colors.errorLight, borderRadius: BorderRadius.md },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: Spacing.xl },
  modalContent: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.xl },
  modalTitle: { fontSize: FontSizes.xl, ...Fonts.bold, color: Colors.text, marginBottom: Spacing.xl },
  formGroup: { marginBottom: Spacing.lg },
  label: { fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.text, marginBottom: 4 },
  input: { backgroundColor: Colors.background, padding: Spacing.md, borderRadius: BorderRadius.md, fontSize: FontSizes.sm, color: Colors.text, borderWidth: 1, borderColor: Colors.borderLight },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  modalBtn: { flex: 1, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  modalBtnText: { color: '#FFF', ...Fonts.bold, fontSize: FontSizes.sm },
});
