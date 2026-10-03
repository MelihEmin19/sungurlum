import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius, Shadows } from '@/constants/theme';
import SpringButton from '@/components/ui/SpringButton';
import { useAuthStore } from '@/stores/authStore';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { seedFirestore } from '@/utils/seedData';
import { checkNextMonthScheduleExists } from '@/services/pharmacies';

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const [missingSchedule, setMissingSchedule] = React.useState(false);

  React.useEffect(() => {
    const checkSchedule = async () => {
      const now = new Date();
      if (now.getDate() >= 25) {
        const exists = await checkNextMonthScheduleExists();
        setMissingSchedule(!exists);
      }
    };
    checkSchedule();
  }, []);

  React.useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Erişim Engellendi', 'Bu sayfayı görüntüleme yetkiniz yok.');
      router.replace('/' as any);
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: Colors.textSecondary }}>Yetki kontrol ediliyor...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <SpringButton style={styles.iconButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </SpringButton>
        <Text style={styles.headerTitle}>Yönetim Paneli</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <AnimatedNumber value={12} delay={200} countUp style={styles.statValue} />
            <Text style={styles.statLabel}>Bekleyen Başvuru</Text>
          </View>
          <View style={styles.statBox}>
            <AnimatedNumber value={5} delay={400} countUp style={styles.statValue} />
            <Text style={styles.statLabel}>Yeni Yorum</Text>
          </View>
        </View>

        {missingSchedule && (
          <View style={[styles.infoBox, { marginBottom: Spacing.xl }]}>
            <MaterialCommunityIcons name="alert" size={24} color={Colors.error} />
            <Text style={styles.infoText}>
              Gelecek ayın nöbetçi eczanelerini henüz girmediniz! Lütfen listeyi güncelleyin.
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Sanal Market & Kurye</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xxl }}>
          <SpringButton style={[styles.orderCard, { flex: 1, marginBottom: 0 }]} onPress={() => router.push('/admin/orders')}>
            <View style={styles.orderIconWrapper}>
              <MaterialCommunityIcons name="moped" size={24} color="#FFF" />
            </View>
            <View style={styles.orderInfo}>
              <Text style={styles.orderStore}>Siparişler</Text>
              <Text style={styles.orderTime}>Canlı Takip</Text>
            </View>
          </SpringButton>
          
          <SpringButton style={[styles.orderCard, { flex: 1, marginBottom: 0, backgroundColor: Colors.info + '15', borderColor: Colors.info + '30' }]} onPress={() => router.push('/admin/market-products')}>
            <View style={[styles.orderIconWrapper, { backgroundColor: Colors.info }]}>
              <MaterialCommunityIcons name="package-variant-closed" size={24} color="#FFF" />
            </View>
            <View style={styles.orderInfo}>
              <Text style={[styles.orderStore, { color: Colors.info }]}>Ürünler</Text>
              <Text style={[styles.orderTime, { color: Colors.info }]}>Depo Yönetimi</Text>
            </View>
          </SpringButton>
        </View>

        <Text style={styles.sectionTitle}>İşlemler</Text>
        <View style={styles.actionMenu}>
          <MenuRow icon="chart-line" title="Sipariş / Gün Sonu Raporu" color={Colors.success} route="/admin/orders-stats" />
          <MenuRow icon="pill" title="Nöbetçi Eczaneler" color={Colors.error} route="/admin/pharmacies" />
          <MenuRow icon="store-plus" title="Esnaf ve Hizmet Veren" color={Colors.primary} route="/admin/businesses" />
          <MenuRow icon="tag-multiple" title="İlan Onayları" color={Colors.info} route="/admin/classifieds" />
          <MenuRow icon="bullhorn" title="Reklam / Kampanya Talepleri" color={Colors.warning} route="/admin/campaigns" />
          <MenuRow icon="comment-check" title="Yorum Moderasyonu" color={Colors.info} route="/admin/reviews" />
          <MenuRow icon="bell-ring" title="Toplu Bildirim (Push) Gönder" color={Colors.error} route="/admin/send-notification" />
          <MenuRow icon="chart-bar" title="Uygulama İstatistikleri" color={Colors.success} route="/admin/statistics" />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Sistem İşlemleri</Text>
        <View style={styles.actionMenu}>
          <MenuRow icon="shape-plus" title="Kategori Yönetimi" color={Colors.primary} route="/admin/categories" />
          <MenuRow icon="store-plus-outline" title="İşletme / Kurum Ekle (Manuel)" color={Colors.info} route="/admin/add-business" />
        </View>
        <View style={{ height: Spacing.xl }} />

      </ScrollView>
    </View>
  );
}

const MenuRow = ({ icon, title, color, route }: { icon: any, title: string, color: string, route?: string }) => {
  const router = useRouter();
  return (
    <SpringButton 
      style={styles.menuRow} 
      onPress={() => route ? router.push(route as any) : Alert.alert('Yakında', 'Bu modül henüz aktif değil.')}
    >
      <View style={[styles.menuIconWrapper, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.menuTitle}>{title}</Text>
      <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textTertiary} />
    </SpringButton>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  iconButton: { width: 44, height: 44, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.xl, ...Fonts.extraBold, color: Colors.text },
  content: { padding: Spacing.xl },
  infoBox: { flexDirection: 'row', padding: Spacing.md, borderRadius: BorderRadius.md, backgroundColor: Colors.errorLight, alignItems: 'center', gap: Spacing.md },
  infoText: { flex: 1, fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.error },
  errorTitle: { fontSize: FontSizes.xl, ...Fonts.bold, color: Colors.text, marginTop: Spacing.lg },
  errorDesc: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.sm, marginBottom: Spacing.xl },
  backButton: { backgroundColor: Colors.surface, paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.borderLight },
  backButtonText: { fontSize: FontSizes.md, ...Fonts.bold, color: Colors.text },
  statsGrid: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xxl },
  statBox: { flex: 1, backgroundColor: Colors.surface, padding: Spacing.lg, borderRadius: BorderRadius.xl, alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.sm },
  statValue: { fontSize: FontSizes.hero, ...Fonts.extraBold, color: Colors.primary },
  statLabel: { fontSize: FontSizes.xs, ...Fonts.bold, color: Colors.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: FontSizes.lg, ...Fonts.extraBold, color: Colors.text, marginBottom: Spacing.md },
  orderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryLight, padding: Spacing.md, borderRadius: BorderRadius.xl, marginBottom: Spacing.xxl, borderWidth: 1, borderColor: Colors.primary + '30' },
  orderIconWrapper: { width: 48, height: 48, borderRadius: BorderRadius.lg, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  orderInfo: { flex: 1 },
  orderStore: { fontSize: FontSizes.md, ...Fonts.bold, color: Colors.primary, marginBottom: 2 },
  orderTime: { fontSize: FontSizes.xs, ...Fonts.medium, color: Colors.primary },
  statusBadge: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full },
  statusText: { fontSize: 10, ...Fonts.bold, color: Colors.primary },
  actionMenu: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.borderLight, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  menuIconWrapper: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  menuTitle: { flex: 1, fontSize: FontSizes.md, ...Fonts.bold, color: Colors.text },
});
