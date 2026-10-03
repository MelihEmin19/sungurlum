import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Switch, Modal, Linking } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius, Shadows } from '@/constants/theme';
import SpringButton from '@/components/ui/SpringButton';
import { useAuthStore } from '@/stores/authStore';
import { logout } from '@/services/auth';
import { getUserApplicationStatus } from '@/services/applications';
import { getUserOrders, Order } from '@/services/orders';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, logout: clearStore } = useAuthStore();
  const [appStatus, setAppStatus] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [notifyCampaigns, setNotifyCampaigns] = useState(true);
  const [notifyMunicipality, setNotifyMunicipality] = useState(true);
  const [notifyObituaries, setNotifyObituaries] = useState(false); // Default false as per user request

  const handleLogout = async () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { 
        text: 'Çıkış Yap', 
        style: 'destructive',
        onPress: async () => {
          await logout();
          clearStore();
        }
      }
    ]);
  };

  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated && user?.uid) {
        getUserApplicationStatus(user.uid).then(setAppStatus);
        getUserOrders(user.uid).then(orders => {
          const active = orders.find(o => ['pending', 'preparing', 'on_way'].includes(o.status));
          setActiveOrder(active || null);
        });
      }
    }, [isAuthenticated, user?.uid])
  );

  // --------------------------------------------------------
  // EĞER KULLANICI GİRİŞ YAPMAMIŞSA (Unauthenticated State)
  // --------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.unauthHeader}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>
        
        <View style={styles.unauthContent}>
          <View style={styles.bentoBox}>
            <View style={styles.bentoIconWrapper}>
              <MaterialCommunityIcons name="star-shooting" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.bentoTitle}>Topluluğa Katılın</Text>
            <Text style={styles.bentoDescription}>
              Favori esnaflarınızı kaydedin, deneyimlerinizi paylaşın ve şehre puan verin.
            </Text>

            <SpringButton style={styles.primaryButton} onPress={() => router.push('/auth/login')}>
              <Text style={styles.primaryButtonText}>Giriş Yap</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
            </SpringButton>

            <View style={styles.bentoDivider} />

            <Text style={styles.bentoFooterText}>Hesabınız yok mu?</Text>
            <SpringButton style={styles.secondaryButton} onPress={() => router.push('/auth/register')}>
              <Text style={styles.secondaryButtonText}>Hemen Kayıt Ol</Text>
            </SpringButton>

          </View>
        </View>
      </View>
    );
  }

  // --------------------------------------------------------
  // EĞER KULLANICI GİRİŞ YAPMIŞSA (Authenticated State)
  // --------------------------------------------------------
  return (
    <View style={styles.container}>
      <View style={styles.authHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.displayName?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.displayName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Active Order Banner */}
        {activeOrder && (
          <SpringButton 
            style={{ backgroundColor: Colors.surface, padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: Colors.borderLight, flexDirection: 'row', alignItems: 'center', ...Shadows.sm }}
            onPress={() => router.push(`/my-orders/${activeOrder.id}` as any)}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <MaterialCommunityIcons name="bike-fast" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: Colors.primary, marginBottom: 2 }}>Aktif Siparişiniz Var</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text }}>
                {activeOrder.status === 'pending' ? 'Siparişiniz Onay Bekliyor' : 
                 activeOrder.status === 'preparing' ? 'Siparişiniz Hazırlanıyor' : 'Kurye Yolda!'}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.textSecondary} />
          </SpringButton>
        )}

        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.sm }]}>
            <MaterialCommunityIcons name="heart" size={24} color={Colors.favorite} />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Favori</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.sm }]}>
            <MaterialCommunityIcons name="star" size={24} color={Colors.warning} />
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Yorum</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Hesap Yönetimi</Text>
        
        <View style={styles.menuContainer}>
          <MenuRow icon="shopping-outline" title="Siparişlerim" onPress={() => router.push('/my-orders' as any)} color={Colors.primary} />
          <MenuRow icon="map-marker-outline" title="Adreslerim" onPress={() => router.push('/profile/addresses' as any)} color={Colors.primary} />
          <MenuRow icon="bullhorn-outline" title="İlanlarım" onPress={() => router.push('/my-ads' as any)} color={Colors.primary} />
          <MenuRow icon="heart-outline" title="Favorilerim" onPress={() => router.push('/(tabs)/favorites' as any)} color={Colors.primary} />
          <MenuRow icon="comment-text-outline" title="Yorumlarım" onPress={() => router.push('/my-reviews' as any)} color={Colors.primary} />
          
          {user?.role === 'business' ? (
            <>
              <MenuRow icon="store-cog-outline" title="İşletme Panelim" onPress={() => router.push('/business-dashboard' as any)} color={Colors.primary} />
              <MenuRow icon="bullhorn-outline" title="Reklam ve Kampanya Başvurusu" onPress={() => router.push('/apply/campaign' as any)} color={Colors.primary} />
            </>
          ) : appStatus === 'pending' ? (
            <MenuRow icon="clock-outline" title="Başvurunuz İncenleniyor" onPress={() => {}} color={Colors.warning} />
          ) : appStatus === 'rejected' ? (
            <MenuRow icon="close-circle-outline" title="Esnaf Başvurunuz Reddedildi" onPress={() => router.push('/apply/business' as any)} color={Colors.error} />
          ) : (
            <MenuRow icon="storefront-outline" title="Esnaf ve Hizmet Veren Ol" onPress={() => router.push('/apply/business' as any)} color={Colors.primary} />
          )}
          
          <MenuRow icon="headset" title="İstek, Şikayet ve Canlı Destek" onPress={() => router.push('/contact' as any)} color={Colors.primary} />
          
          <MenuRow icon="file-document-outline" title="Sözleşmeler ve Yasal Metinler" onPress={() => Linking.openURL('https://sungurlum.com/kvkk.html').catch(() => Alert.alert('Hata', 'Sayfa açılamadı.'))} color={Colors.primary} />
          
          <SpringButton style={styles.menuRow} onPress={() => setSettingsVisible(true)}>
            <View style={[styles.menuIconWrapper, { backgroundColor: Colors.primary + '15' }]}>
              <MaterialCommunityIcons name="bell-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.menuTitle}>Bildirim Ayarları</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textTertiary} />
          </SpringButton>
          
          {user?.role === 'admin' && (
            <MenuRow icon="shield-account-outline" title="Yönetici Paneli" onPress={() => router.push('/admin')} color={Colors.error} />
          )}
        </View>

        <SpringButton style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </SpringButton>

      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={settingsVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSettingsVisible(false)}>
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Bildirim Ayarları</Text>
            <SpringButton onPress={() => setSettingsVisible(false)}>
              <MaterialCommunityIcons name="close-circle" size={28} color={Colors.textSecondary} />
            </SpringButton>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>Size hangi konularda bildirim göndermemizi istersiniz?</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Kampanya ve İndirimler</Text>
                <Text style={styles.settingDescription}>Esnafların sunduğu özel fırsatlar.</Text>
              </View>
              <Switch 
                value={notifyCampaigns} 
                onValueChange={setNotifyCampaigns}
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Şehir ve Belediye</Text>
                <Text style={styles.settingDescription}>Su/Elektrik kesintileri, etkinlikler.</Text>
              </View>
              <Switch 
                value={notifyMunicipality} 
                onValueChange={setNotifyMunicipality}
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>

            <View style={[styles.settingRow, styles.settingRowWarning]}>
              <View style={styles.settingInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name="coffin" size={16} color={Colors.textSecondary} />
                  <Text style={styles.settingTitle}>Vefat İlanları</Text>
                </View>
                <Text style={styles.settingDescription}>Günlük vefat ve cenaze duyuruları.</Text>
              </View>
              <Switch 
                value={notifyObituaries} 
                onValueChange={setNotifyObituaries}
                trackColor={{ false: Colors.border, true: Colors.textSecondary }}
              />
            </View>
            <Text style={styles.noteText}>* Vefat ilanları isteğe bağlıdır, dilediğiniz zaman açıp kapatabilirsiniz.</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Helper Component for Menu Rows
const MenuRow = ({ icon, title, onPress, color }: { icon: any, title: string, onPress: () => void, color: string }) => (
  <SpringButton style={styles.menuRow} onPress={onPress}>
    <View style={[styles.menuIconWrapper, { backgroundColor: color + '15' }]}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.menuTitle}>{title}</Text>
    <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textTertiary} />
  </SpringButton>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  unauthHeader: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxxl, paddingBottom: Spacing.md },
  headerTitle: { fontSize: FontSizes.xxl, ...Fonts.extraBold, color: Colors.text, letterSpacing: -0.5 },
  unauthContent: { flex: 1, padding: Spacing.xl, justifyContent: 'center' },
  bentoBox: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xxl, padding: Spacing.xxl, alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.lg },
  bentoIconWrapper: { width: 64, height: 64, borderRadius: BorderRadius.xl, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  bentoTitle: { fontSize: FontSizes.xl, ...Fonts.bold, color: Colors.text, marginBottom: Spacing.sm, textAlign: 'center' },
  bentoDescription: { fontSize: FontSizes.md, color: Colors.textSecondary, ...Fonts.medium, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xxl },
  primaryButton: { flexDirection: 'row', backgroundColor: Colors.primary, width: '100%', height: 56, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  primaryButtonText: { color: '#FFF', fontSize: FontSizes.md, ...Fonts.bold },
  bentoDivider: { width: '100%', height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.xl },
  bentoFooterText: { fontSize: FontSizes.sm, color: Colors.textSecondary, ...Fonts.medium, marginBottom: Spacing.md },
  secondaryButton: { backgroundColor: Colors.surface, width: '100%', height: 56, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.border },
  secondaryButtonText: { color: Colors.text, fontSize: FontSizes.md, ...Fonts.bold },

  authHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxxl, paddingBottom: Spacing.xl, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  avatarContainer: { width: 60, height: 60, borderRadius: BorderRadius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  avatarText: { color: '#FFF', fontSize: FontSizes.xxl, ...Fonts.extraBold },
  userInfo: { flex: 1 },
  userName: { fontSize: FontSizes.lg, ...Fonts.bold, color: Colors.text, marginBottom: 2 },
  userEmail: { fontSize: FontSizes.sm, color: Colors.textSecondary, ...Fonts.medium },
  scrollContent: { padding: Spacing.xl },
  statsContainer: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xxl },
  statBox: { flex: 1, borderRadius: BorderRadius.xl, padding: Spacing.lg, alignItems: 'center' },
  statNumber: { fontSize: FontSizes.xxl, ...Fonts.extraBold, color: Colors.text, marginTop: Spacing.sm },
  statLabel: { fontSize: FontSizes.xs, ...Fonts.bold, color: Colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: FontSizes.lg, ...Fonts.extraBold, color: Colors.text, letterSpacing: -0.3, marginBottom: Spacing.md },
  menuContainer: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.borderLight, overflow: 'hidden', marginBottom: Spacing.xxl },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  menuIconWrapper: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  menuTitle: { flex: 1, fontSize: FontSizes.md, ...Fonts.bold, color: Colors.text },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.errorLight, paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg, gap: Spacing.sm, marginBottom: Spacing.xxxl },
  logoutText: { color: Colors.error, fontSize: FontSizes.md, ...Fonts.bold },

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  modalTitle: { fontSize: FontSizes.xl, ...Fonts.extraBold, color: Colors.text },
  modalContent: { padding: Spacing.xl },
  modalSubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, ...Fonts.medium, marginBottom: Spacing.xl, lineHeight: 22 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  settingRowWarning: { backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border, marginTop: Spacing.md },
  settingInfo: { flex: 1, paddingRight: Spacing.md },
  settingTitle: { fontSize: FontSizes.md, ...Fonts.bold, color: Colors.text, marginBottom: 4 },
  settingDescription: { fontSize: FontSizes.sm, color: Colors.textSecondary, ...Fonts.medium, lineHeight: 20 },
  noteText: { fontSize: 11, color: Colors.textTertiary, marginTop: Spacing.md, fontStyle: 'italic' },
});
