import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius, Shadows } from '@/constants/theme';
import SpringButton from '@/components/ui/SpringButton';
import { useAuthStore } from '@/stores/authStore';
import { getMyClassifieds } from '@/services/classifieds';
import { getFavoriteCountForTarget } from '@/services/favorites';

export default function MyAdsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      if (!user) return;
      try {
        const myAds = await getMyClassifieds(user.uid);
        
        // Fetch favorite counts
        const adsWithCounts = await Promise.all(myAds.map(async (ad) => {
          const favCount = await getFavoriteCountForTarget(ad.id);
          return { ...ad, favCount };
        }));

        setAds(adsWithCounts);
      } catch (error) {
        console.error('İlanlar çekilemedi', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return { text: 'Yayında', color: Colors.success, bg: Colors.success + '15' };
      case 'pending':
        return { text: 'Onay Bekliyor', color: Colors.warning, bg: Colors.warning + '15' };
      case 'rejected':
        return { text: 'Reddedildi', color: Colors.error, bg: Colors.error + '15' };
      default:
        return { text: 'Bilinmiyor', color: Colors.textSecondary, bg: Colors.surface };
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <SpringButton style={styles.iconButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </SpringButton>
        <Text style={styles.headerTitle}>İlanlarım</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : ads.length === 0 ? (
          <View style={styles.centerContent}>
            <MaterialCommunityIcons name="bullhorn-outline" size={64} color={Colors.border} />
            <Text style={styles.emptyText}>Henüz hiç ilan vermemişsiniz.</Text>
            <SpringButton style={styles.createButton} onPress={() => router.push('/classifieds/create')}>
              <Text style={styles.createButtonText}>Yeni İlan Ver</Text>
            </SpringButton>
          </View>
        ) : (
          ads.map(ad => {
            const badge = getStatusBadge(ad.status);
            return (
              <SpringButton 
                key={ad.id} 
                style={styles.adCard}
                onPress={() => router.push(`/my-ads/${ad.id}` as any)}
              >
                <View style={styles.adHeader}>
                  <Text style={styles.adTitle} numberOfLines={1}>{ad.title}</Text>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
                  </View>
                </View>
                
                <View style={styles.adDetails}>
                  <Text style={styles.adPrice}>{ad.price} ₺</Text>
                  <Text style={styles.adCategory}>{ad.category.toUpperCase()}</Text>
                </View>

                <View style={styles.adStats}>
                  <View style={styles.stat}>
                    <MaterialCommunityIcons name="eye-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.statText}>{ad.views || 0} Görüntülenme</Text>
                  </View>
                  <View style={styles.stat}>
                    <MaterialCommunityIcons name="heart-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.statText}>{ad.favCount || 0} Favori</Text>
                  </View>
                </View>
              </SpringButton>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  iconButton: { width: 44, height: 44, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.xl, ...Fonts.extraBold, color: Colors.text },
  content: { padding: Spacing.xl },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyText: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.md, ...Fonts.medium, marginBottom: Spacing.xl },
  createButton: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  createButtonText: { color: '#FFF', ...Fonts.bold, fontSize: FontSizes.md },
  adCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.sm },
  adHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.md },
  adTitle: { flex: 1, fontSize: FontSizes.md, ...Fonts.bold, color: Colors.text },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm },
  badgeText: { fontSize: 10, ...Fonts.bold },
  adDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  adPrice: { fontSize: FontSizes.lg, ...Fonts.extraBold, color: Colors.primary },
  adCategory: { fontSize: FontSizes.xs, ...Fonts.bold, color: Colors.textTertiary },
  adStats: { flexDirection: 'row', gap: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.sm },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: FontSizes.xs, ...Fonts.medium, color: Colors.textSecondary },
});
