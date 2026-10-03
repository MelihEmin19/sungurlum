import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius, Shadows } from '@/constants/theme';
import SpringButton from '@/components/ui/SpringButton';
import { useAuthStore } from '@/stores/authStore';
import { getPendingApplications, approveApplication, rejectApplication, getAllBusinesses, hideBusiness, deleteBusiness } from '@/services/admin';
import { getCategories, addCategory } from '@/services/categories';
import { BusinessApplication } from '@/services/applications';
import { Category } from '@/constants/categories';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function AdminBusinessesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');
  const [loading, setLoading] = useState(true);

  const [pendingApps, setPendingApps] = useState<(BusinessApplication & {id: string, createdAt: any})[]>([]);
  const [activeBiz, setActiveBiz] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Approve Modal state
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('');
  
  // New Category State
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('store');

  // Edit Category Modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [businessToEdit, setBusinessToEdit] = useState<any>(null);
  const [editCategorySlug, setEditCategorySlug] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apps, biz, cats] = await Promise.all([
        getPendingApplications(),
        getAllBusinesses(),
        getCategories()
      ]);
      setPendingApps(apps);
      setActiveBiz(biz.filter((b: any) => b.status !== 'hidden'));
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (app: any) => {
    setSelectedApp(app);
    setApproveModalVisible(true);
  };

  const handleReject = async (id: string) => {
    Alert.alert('Reddet', 'Bu başvuruyu reddetmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Reddet', style: 'destructive', onPress: async () => {
        await rejectApplication(id);
        fetchData();
      }}
    ]);
  };

  const confirmApprove = async () => {
    if (!selectedApp) return;

    let finalCategorySlug = selectedCategorySlug;

    // Handle New Category creation
    if (isCreatingCategory) {
      if (!newCatName.trim()) {
        Alert.alert('Hata', 'Kategori adı giriniz.');
        return;
      }
      const slug = newCatName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      finalCategorySlug = slug;
      
      const newCat: Category = {
        id: slug,
        name: newCatName,
        slug: slug,
        icon: newCatIcon || 'store',
        color: Colors.primary,
        order: categories.length + 1,
        subcategories: []
      };
      
      try {
        await addCategory(newCat);
      } catch (error) {
        Alert.alert('Hata', 'Kategori oluşturulamadı.');
        return;
      }
    }

    if (!finalCategorySlug) {
      Alert.alert('Hata', 'Lütfen bir kategori seçin veya oluşturun.');
      return;
    }

    try {
      await approveApplication(selectedApp.id, selectedApp, finalCategorySlug);
      Alert.alert('Başarılı', 'Esnaf onaylandı ve yayına alındı!');
      setApproveModalVisible(false);
      setSelectedApp(null);
      setIsCreatingCategory(false);
      setNewCatName('');
      fetchData();
    } catch (error) {
      Alert.alert('Hata', 'Onaylama başarısız oldu.');
    }
  };

  const handleHideBusiness = (id: string) => {
    Alert.alert('Gizle', 'Bu esnafı yayından kaldırmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Gizle', style: 'destructive', onPress: async () => {
        await hideBusiness(id);
        fetchData();
      }}
    ]);
  };

  const handleDeleteBusiness = (id: string) => {
    Alert.alert('Kalıcı Olarak Sil', 'Bu esnafı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        await deleteBusiness(id);
        fetchData();
      }}
    ]);
  };

  const handleEditBusiness = (biz: any) => {
    setBusinessToEdit(biz);
    setEditCategorySlug(biz.category);
    setEditModalVisible(true);
  };

  const confirmEditCategory = async () => {
    if (!businessToEdit || !editCategorySlug) return;
    try {
      await updateDoc(doc(db, 'businesses', businessToEdit.id), {
        category: editCategorySlug
      });
      Alert.alert('Başarılı', 'Kategori güncellendi.');
      setEditModalVisible(false);
      setBusinessToEdit(null);
      fetchData();
    } catch (error) {
      Alert.alert('Hata', 'Güncelleme başarısız.');
    }
  };

  const renderPending = () => (
    <View>
      {pendingApps.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="clipboard-check-outline" size={48} color={Colors.border} />
          <Text style={styles.emptyText}>Bekleyen başvuru bulunmuyor.</Text>
        </View>
      ) : (
        pendingApps.map(app => (
          <View key={app.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{app.name}</Text>
              <Text style={styles.dateText}>
                {app.createdAt?.toDate ? app.createdAt.toDate().toLocaleDateString('tr-TR') : ''}
              </Text>
            </View>
            <Text style={styles.cardText}>Kişi: {app.fullName}</Text>
            <Text style={styles.cardText}>Telefon: {app.phone}</Text>
            <Text style={styles.cardText}>Adres: {app.address}</Text>
            <Text style={styles.cardText}>Meslek: {app.businessType || app.category}</Text>
            
            <View style={styles.actionRow}>
              <SpringButton style={[styles.actionBtn, { backgroundColor: Colors.errorLight }]} onPress={() => handleReject(app.id)}>
                <Text style={[styles.actionBtnText, { color: Colors.error }]}>Reddet</Text>
              </SpringButton>
              <SpringButton style={[styles.actionBtn, { backgroundColor: Colors.successLight }]} onPress={() => handleApproveClick(app)}>
                <Text style={[styles.actionBtnText, { color: Colors.success }]}>Onayla</Text>
              </SpringButton>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderActive = () => (
    <View>
      {activeBiz.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Kayıtlı aktif esnaf bulunmuyor.</Text>
        </View>
      ) : (
        activeBiz.map(biz => (
          <View key={biz.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{biz.name}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{biz.category}</Text>
              </View>
            </View>
            <Text style={styles.cardText}>Telefon: {biz.phone}</Text>
            
            <View style={styles.actionRow}>
              <SpringButton style={[styles.actionBtn, { backgroundColor: Colors.infoLight }]} onPress={() => handleEditBusiness(biz)}>
                <Text style={[styles.actionBtnText, { color: Colors.info }]}>Düzenle</Text>
              </SpringButton>
              <SpringButton style={[styles.actionBtn, { backgroundColor: Colors.warningLight }]} onPress={() => handleHideBusiness(biz.id)}>
                <Text style={[styles.actionBtnText, { color: Colors.warning }]}>Gizle</Text>
              </SpringButton>
              <SpringButton style={[styles.actionBtn, { backgroundColor: Colors.errorLight }]} onPress={() => handleDeleteBusiness(biz.id)}>
                <Text style={[styles.actionBtnText, { color: Colors.error }]}>Sil</Text>
              </SpringButton>
            </View>
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <SpringButton onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </SpringButton>
        <Text style={styles.headerTitle}>Esnaf Yönetimi</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.tabs}>
        <SpringButton style={[styles.tab, activeTab === 'pending' && styles.activeTab]} onPress={() => setActiveTab('pending')}>
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>Başvurular ({pendingApps.length})</Text>
        </SpringButton>
        <SpringButton style={[styles.tab, activeTab === 'active' && styles.activeTab]} onPress={() => setActiveTab('active')}>
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Mevcut Esnaflar</Text>
        </SpringButton>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          activeTab === 'pending' ? renderPending() : renderActive()
        )}
      </ScrollView>

      {/* Approve Modal */}
      <Modal visible={approveModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kategori Seçimi</Text>
            <Text style={styles.modalSubtitle}>{selectedApp?.name} için kategori atayın.</Text>
            
            <ScrollView style={styles.categoryList}>
              {!isCreatingCategory ? (
                <>
                  {categories.map(c => (
                    <SpringButton 
                      key={c.id} 
                      style={[styles.catOption, selectedCategorySlug === c.slug && styles.catOptionActive]}
                      onPress={() => setSelectedCategorySlug(c.slug)}
                    >
                      <MaterialCommunityIcons name={c.icon as any} size={20} color={selectedCategorySlug === c.slug ? Colors.primary : Colors.textSecondary} />
                      <Text style={[styles.catOptionText, selectedCategorySlug === c.slug && { color: Colors.primary, ...Fonts.bold }]}>{c.name}</Text>
                    </SpringButton>
                  ))}
                  <SpringButton style={styles.newCatBtn} onPress={() => setIsCreatingCategory(true)}>
                    <MaterialCommunityIcons name="plus" size={20} color={Colors.primary} />
                    <Text style={styles.newCatBtnText}>Yeni Kategori Ekle</Text>
                  </SpringButton>
                </>
              ) : (
                <View style={styles.newCatForm}>
                  <TextInput
                    style={styles.input}
                    placeholder="Kategori Adı (Örn: Çiçekçi)"
                    value={newCatName}
                    onChangeText={setNewCatName}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="İkon Adı (Örn: flower)"
                    value={newCatIcon}
                    onChangeText={setNewCatIcon}
                    autoCapitalize="none"
                  />
                  <SpringButton style={{ padding: Spacing.sm }} onPress={() => setIsCreatingCategory(false)}>
                    <Text style={{ color: Colors.primary, textAlign: 'center' }}>Vazgeç</Text>
                  </SpringButton>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <SpringButton style={[styles.modalBtn, { backgroundColor: Colors.surface }]} onPress={() => {
                setApproveModalVisible(false);
                setIsCreatingCategory(false);
              }}>
                <Text style={[styles.modalBtnText, { color: Colors.text }]}>İptal</Text>
              </SpringButton>
              <SpringButton style={[styles.modalBtn, { backgroundColor: Colors.primary }]} onPress={confirmApprove}>
                <Text style={styles.modalBtnText}>Onayla ve Kaydet</Text>
              </SpringButton>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Category Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kategori Düzenle</Text>
            <Text style={styles.modalSubtitle}>{businessToEdit?.name} için yeni kategori seçin.</Text>
            
            <ScrollView style={styles.categoryList}>
              {categories.map(c => (
                <SpringButton 
                  key={c.id} 
                  style={[styles.catOption, editCategorySlug === c.slug && styles.catOptionActive]}
                  onPress={() => setEditCategorySlug(c.slug)}
                >
                  <MaterialCommunityIcons name={c.icon as any} size={20} color={editCategorySlug === c.slug ? Colors.primary : Colors.textSecondary} />
                  <Text style={[styles.catOptionText, editCategorySlug === c.slug && { color: Colors.primary, ...Fonts.bold }]}>{c.name}</Text>
                </SpringButton>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <SpringButton style={[styles.modalBtn, { backgroundColor: Colors.surface }]} onPress={() => setEditModalVisible(false)}>
                <Text style={[styles.modalBtnText, { color: Colors.text }]}>İptal</Text>
              </SpringButton>
              <SpringButton style={[styles.modalBtn, { backgroundColor: Colors.primary }]} onPress={confirmEditCategory}>
                <Text style={styles.modalBtnText}>Güncelle</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backButton: { width: 44, height: 44, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.lg, ...Fonts.bold, color: Colors.text },
  tabs: { flexDirection: 'row', padding: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  tab: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: Colors.primary },
  tabText: { fontSize: FontSizes.sm, ...Fonts.medium, color: Colors.textSecondary },
  activeTabText: { color: Colors.primary, ...Fonts.bold },
  scrollContent: { padding: Spacing.lg },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: FontSizes.md, ...Fonts.medium, color: Colors.textSecondary, marginTop: Spacing.md },
  
  card: { backgroundColor: Colors.surface, padding: Spacing.lg, borderRadius: BorderRadius.xl, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  cardTitle: { fontSize: FontSizes.md, ...Fonts.bold, color: Colors.text, flex: 1 },
  dateText: { fontSize: FontSizes.xs, color: Colors.textTertiary, marginLeft: Spacing.sm },
  cardText: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: 2 },
  badge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm, marginLeft: Spacing.sm },
  badgeText: { fontSize: FontSizes.xs, color: Colors.primary, ...Fonts.bold },
  
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm, marginTop: Spacing.md },
  actionBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  actionBtnText: { fontSize: FontSizes.sm, ...Fonts.bold },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: Spacing.xl },
  modalContent: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.xl, maxHeight: '80%' },
  modalTitle: { fontSize: FontSizes.xl, ...Fonts.bold, color: Colors.text, marginBottom: 4 },
  modalSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },
  categoryList: { maxHeight: 300, marginBottom: Spacing.xl },
  catOption: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.md, backgroundColor: Colors.background, marginBottom: Spacing.sm, gap: Spacing.sm },
  catOptionActive: { backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primary },
  catOptionText: { fontSize: FontSizes.sm, color: Colors.text },
  newCatBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: Spacing.md, borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.primary, borderRadius: BorderRadius.md, gap: Spacing.sm, marginTop: Spacing.sm },
  newCatBtnText: { color: Colors.primary, ...Fonts.bold, fontSize: FontSizes.sm },
  newCatForm: { gap: Spacing.sm, paddingVertical: Spacing.md },
  input: { backgroundColor: Colors.background, padding: Spacing.md, borderRadius: BorderRadius.md, fontSize: FontSizes.sm, color: Colors.text, borderWidth: 1, borderColor: Colors.borderLight },
  
  modalActions: { flexDirection: 'row', gap: Spacing.md },
  modalBtn: { flex: 1, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  modalBtnText: { color: '#FFF', ...Fonts.bold, fontSize: FontSizes.sm },
});
