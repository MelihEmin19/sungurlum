import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SpringButton from '@/components/ui/SpringButton';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius, Shadows } from '@/constants/theme';
import { getAllOrders, Order } from '@/services/orders';

export default function AdminOrdersSummary() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getAllOrders();
        // Sadece bugünün siparişlerini filtreleyelim
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todaysOrders = data.filter(order => {
          if (!order.createdAt?.toDate) return false;
          const orderDate = order.createdAt.toDate();
          return orderDate >= today && order.status !== 'cancelled';
        });
        
        setOrders(todaysOrders);
      } catch (error) {
        console.error('Error fetching admin orders summary:', error);
        Alert.alert('Hata', 'Siparişler yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Calculate statistics
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const customOrders = orders.filter(o => o.type === 'custom');
  const marketOrders = orders.filter(o => o.type === 'market');
  
  // Product frequency map
  const productCounts: Record<string, { quantity: number, revenue: number }> = {};
  
  marketOrders.forEach(order => {
    order.items?.forEach(item => {
      if (!productCounts[item.name]) {
        productCounts[item.name] = { quantity: 0, revenue: 0 };
      }
      productCounts[item.name].quantity += item.quantity;
      productCounts[item.name].revenue += (item.price * item.quantity);
    });
  });
  
  const topProducts = Object.entries(productCounts)
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 10); // Top 10

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <SpringButton style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </SpringButton>
        <Text style={styles.headerTitle}>Gün Sonu Raporu</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Bugünkü Ciro (İptaller Hariç)</Text>
          <Text style={styles.summaryAmount}>₺{totalRevenue.toLocaleString('tr-TR')}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxValue}>{orders.length}</Text>
              <Text style={styles.statBoxLabel}>Toplam Sipariş</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statBoxValue}>{marketOrders.length}</Text>
              <Text style={styles.statBoxLabel}>Market/Manav</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statBoxValue}>{customOrders.length}</Text>
              <Text style={styles.statBoxLabel}>Özel İstek</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Satılan Market Ürünleri</Text>
        
        {topProducts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Bugün hiç market ürünü satılmamış.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <View style={styles.listHeaderRow}>
              <Text style={[styles.listHeaderCell, { flex: 2 }]}>Ürün Adı</Text>
              <Text style={[styles.listHeaderCell, { flex: 1, textAlign: 'center' }]}>Adet</Text>
              <Text style={[styles.listHeaderCell, { flex: 1, textAlign: 'right' }]}>Tutar</Text>
            </View>
            {topProducts.map(([name, stats], index) => (
              <View key={index} style={styles.listRow}>
                <Text style={[styles.listCell, { flex: 2 }]} numberOfLines={1}>{name}</Text>
                <Text style={[styles.listCell, { flex: 1, textAlign: 'center', ...Fonts.bold }]}>{stats.quantity}</Text>
                <Text style={[styles.listCell, { flex: 1, textAlign: 'right', color: Colors.primary, ...Fonts.bold }]}>₺{stats.revenue}</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, backgroundColor: Colors.surface },
  backButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  headerTitle: { fontSize: FontSizes.xl, ...Fonts.extraBold, color: Colors.text },
  content: { padding: Spacing.xl },
  summaryCard: { backgroundColor: Colors.primary, borderRadius: BorderRadius.xl, padding: Spacing.xl, marginBottom: Spacing.xxl, ...Shadows.md },
  summaryTitle: { fontSize: FontSizes.sm, color: 'rgba(255,255,255,0.8)', ...Fonts.medium, marginBottom: Spacing.xs, textAlign: 'center' },
  summaryAmount: { fontSize: 36, ...Fonts.extraBold, color: '#FFF', textAlign: 'center', marginBottom: Spacing.lg },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.lg, padding: Spacing.md },
  statBox: { flex: 1, alignItems: 'center' },
  statBoxValue: { fontSize: FontSizes.xl, ...Fonts.bold, color: '#FFF' },
  statBoxLabel: { fontSize: 10, ...Fonts.medium, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: Spacing.sm },
  sectionTitle: { fontSize: FontSizes.lg, ...Fonts.extraBold, color: Colors.text, marginBottom: Spacing.md },
  emptyBox: { padding: Spacing.xl, alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.borderLight },
  emptyText: { color: Colors.textSecondary, ...Fonts.medium },
  listContainer: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.borderLight, overflow: 'hidden' },
  listHeaderRow: { flexDirection: 'row', backgroundColor: Colors.background, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  listHeaderCell: { fontSize: FontSizes.xs, ...Fonts.bold, color: Colors.textSecondary },
  listRow: { flexDirection: 'row', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  listCell: { fontSize: FontSizes.sm, ...Fonts.medium, color: Colors.text },
});
