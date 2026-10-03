import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius, Shadows } from '@/constants/theme';
import SpringButton from '@/components/ui/SpringButton';
import { useAuthStore } from '@/stores/authStore';
import { getMyFavorites, FavoriteItem } from '@/services/favorites';
import { getBusinessById } from '@/services/businesses';
import { getClassifiedById } from '@/services/classifieds';
import BusinessCard from '@/components/BusinessCard';

export default function FavoritesScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'business' | 'classified'>('business');
  const [loading, setLoading] = useState(true);
  
  const [favBusinesses, setFavBusinesses] = useState<any[]>([]);
  const [favAds, setFavAds] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchFavs = async () => {
      if (!isAuthenticated || !user) return;
      setLoading(true);
      try {
        const myFavs = await getMyFavorites(user.uid);
        
        const bFavs = myFavs.filter(f => f.targetType === 'business');
        const aFavs = myFavs.filter(f => f.targetType === 'classified');
        
        // Fetch real businesses from Firestore
        const bizData = await Promise.all(
          bFavs.map(f => getBusinessById(f.targetId))
        );
        setFavBusinesses(bizData.filter(Boolean));

        // Fetch real ads from Firestore
        const adsData = await Promise.all(
          aFavs.map(f => getClassifiedById(f.targetId))
        );
        setFavAds(adsData.filter(Boolean));

      } catch (error) {
        console.error('Error fetching favs', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavs();
    }, [isAuthenticated, user])
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Favoriler</Text>
        </View>
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="heart-multiple-outline" size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>Giriş Yapmalısınız</Text>
          <Text style={styles.emptySubtitle}>
            Favori esnaflarınızı ve ilanlarınızı kaydetmek için lütfen giriş yapın.
          </Text>
          <SpringButton style={styles.primaryButton} onPress={() => router.push('/auth/login')}>
            <Text style={styles.primaryButtonText}>Giriş Yap / Kayıt Ol</Text>
          </SpringButton>
        </View>
      </View>
    );
  }

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <SpringButton 
        style={[styles.tab, activeTab === 'business' && styles.activeTab]}
        onPress={() => setActiveTab('business')}
      >
        <Text style={[styles.tabText, activeTab === 'business' && styles.activeTabText]}>
          Esnaflar ({favBusinesses.length})
        </Text>
      </SpringButton>
      <SpringButton 
        style={[styles.tab, activeTab === 'classified' && styles.activeTab]}
        onPress={() => setActiveTab('classified')}
      >
        <Text style={[styles.tabText, activeTab === 'classified' && styles.activeTabText]}>
          İlanlar ({favAds.length})
        </Text>
      </SpringButton>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorilerim</Text>
      </View>

      {renderTabs()}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {loading ? (
          <View style={styles.centerContent}>
             <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : activeTab === 'business' ? (
          favBusinesses.length === 0 ? (
            <View style={styles.centerContent}>
              <MaterialCommunityIcons name="store-remove-outline" size={64} color={Colors.border} />
              <Text style={styles.emptyTitle}>Esnaf Favoriniz Yok</Text>
              <SpringButton style={styles.secondaryButton} onPress={() => router.push('/(tabs)/categories')}>
                <Text style={styles.secondaryButtonText}>Esnafları Keşfet</Text>
              </SpringButton>
            </View>
          ) : (
            favBusinesses.map(b => <BusinessCard key={b.id} business={b} />)
          )
        ) : (
          favAds.length === 0 ? (
            <View style={styles.centerContent}>
              <MaterialCommunityIcons name="newspaper-variant-outline" size={64} color={Colors.border} />
              <Text style={styles.emptyTitle}>İlan Favoriniz Yok</Text>
              <SpringButton style={styles.secondaryButton} onPress={() => router.push('/classifieds')}>
                <Text style={styles.secondaryButtonText}>İlanları İncele</Text>
              </SpringButton>
            </View>
          ) : (
            favAds.map(ad => (
              <SpringButton 
                key={ad.id} 
                style={styles.adCard}
                onPress={() => router.push(`/classifieds/detail/${ad.id}` as any)}
              >
                <View style={styles.adHeader}>
                  <Text style={styles.adTitle} numberOfLines={1}>{ad.title}</Text>
                  <Text style={styles.adPrice}>{ad.price} ₺</Text>
                </View>
                <View style={styles.adDetails}>
                  <Text style={styles.adLocation}><MaterialCommunityIcons name="map-marker" /> {ad.location}</Text>
                  <Text style={styles.adCategory}>{ad.category.toUpperCase()}</Text>
                </View>
              </SpringButton>
            ))
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxxl, paddingBottom: Spacing.md, backgroundColor: Colors.surface,
  },
  headerTitle: { fontSize: FontSizes.xxl, ...Fonts.extraBold, color: Colors.text, letterSpacing: -0.5 },
  tabContainer: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: Spacing.md
  },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: BorderRadius.md, backgroundColor: Colors.background },
  activeTab: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.textSecondary },
  activeTabText: { color: '#FFF' },
  scrollContent: { padding: Spacing.xl, flexGrow: 1 },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: FontSizes.xl, ...Fonts.bold, color: Colors.text, marginTop: Spacing.lg, marginBottom: Spacing.lg },
  emptySubtitle: { fontSize: FontSizes.md, ...Fonts.medium, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xxl },
  primaryButton: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xxl, paddingVertical: 16, borderRadius: BorderRadius.lg },
  primaryButtonText: { color: '#FFF', fontSize: FontSizes.md, ...Fonts.bold },
  secondaryButton: { backgroundColor: Colors.surface, paddingHorizontal: Spacing.xxl, paddingVertical: 16, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.borderLight },
  secondaryButtonText: { color: Colors.text, fontSize: FontSizes.md, ...Fonts.bold },
  
  adCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.sm },
  adHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  adTitle: { flex: 1, fontSize: FontSizes.md, ...Fonts.bold, color: Colors.text },
  adPrice: { fontSize: FontSizes.lg, ...Fonts.extraBold, color: Colors.primary, marginLeft: Spacing.md },
  adDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  adLocation: { fontSize: FontSizes.sm, ...Fonts.medium, color: Colors.textSecondary },
  adCategory: { fontSize: FontSizes.xs, ...Fonts.bold, color: Colors.textTertiary },
});
