import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius, Shadows } from '@/constants/theme';
import SpringButton from '@/components/ui/SpringButton';
import { getApprovedClassifieds } from '@/services/classifieds';

const CLASSIFIED_CATEGORIES = [
  { id: 'ikinci-el', name: '2. El Eşya', icon: 'sofa' },
  { id: 'is-ilanlari', name: 'İş İlanları', icon: 'briefcase' },
];

export default function ClassifiedsHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [showcaseAds, setShowcaseAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        // Vitrin için tüm onaylı ilanları getiriyoruz (ilk 50)
        const ads = await getApprovedClassifieds();
        setShowcaseAds(ads.slice(0, 5)); // Şimdilik vitrinde ilk 5 ilanı gösterelim
      } catch (error) {
        console.error('İlanlar çekilemedi', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <SpringButton style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </SpringButton>
        <Text style={styles.headerTitle}>Şehir İlanları</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Create Ad Button */}
        <SpringButton 
          style={{ backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.xl, ...Shadows.sm }}
          onPress={() => router.push('/classifieds/create')}
        >
          <MaterialCommunityIcons name="plus-circle-outline" size={24} color="#FFF" />
          <Text style={{ color: '#FFF', fontSize: FontSizes.md, ...Fonts.bold, marginLeft: Spacing.sm }}>İlan Ver</Text>
        </SpringButton>
        
        {/* Categories Grid */}
        <Text style={styles.sectionTitle}>Kategoriler</Text>
        <View style={styles.grid}>
          {CLASSIFIED_CATEGORIES.map((cat) => (
            <SpringButton 
              key={cat.id} 
              style={styles.categoryBox}
              onPress={() => router.push(`/classifieds/${cat.id}` as any)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderLight }]}>
                <MaterialCommunityIcons name={cat.icon as any} size={32} color={Colors.primary} />
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </SpringButton>
          ))}
        </View>

        {/* Showcase / Vitrin */}
        <View style={styles.showcaseHeader}>
          <Text style={styles.sectionTitle}>Vitrin İlanları</Text>
        </View>
        
        {loading ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <Text style={{ color: Colors.textSecondary }}>Yükleniyor...</Text>
          </View>
        ) : showcaseAds.length === 0 ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.borderLight }}>
            <MaterialCommunityIcons name="home-city-outline" size={48} color={Colors.border} />
            <Text style={{ marginTop: Spacing.md, color: Colors.textSecondary, ...Fonts.medium }}>Henüz vitrinde ilan bulunmuyor.</Text>
          </View>
        ) : (
          <View style={styles.showcaseList}>
            {showcaseAds.map((ad) => (
              <SpringButton 
                key={ad.id} 
                style={styles.adCard}
                onPress={() => router.push(`/classifieds/detail/${ad.id}` as any)}
              >
                <View style={styles.adImageContainer}>
                  {ad.images && ad.images.length > 0 ? (
                    <Image source={{ uri: ad.images[0] }} style={styles.adImage} />
                  ) : (
                    <View style={[styles.adImage, styles.noImage]}>
                      <MaterialCommunityIcons name="image-outline" size={32} color={Colors.border} />
                    </View>
                  )}
                  <View style={styles.adPriceBadge}>
                    <Text style={styles.adPriceText}>{ad.price} ₺</Text>
                  </View>
                </View>
                <View style={styles.adInfo}>
                  <Text style={styles.adTitle} numberOfLines={2}>{ad.title}</Text>
                  <View style={styles.adFooter}>
                    <View style={styles.adLocation}>
                      <MaterialCommunityIcons name="account-outline" size={12} color={Colors.textTertiary} />
                      <Text style={styles.adLocationText}>{ad.userName}</Text>
                    </View>
                    <Text style={styles.adDateText}>
                      {ad.createdAt?.toDate ? ad.createdAt.toDate().toLocaleDateString('tr-TR') : 'Yeni'}
                    </Text>
                  </View>
                </View>
              </SpringButton>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    ...Fonts.extraBold,
    color: Colors.text,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  content: {
    padding: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    ...Fonts.extraBold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  categoryBox: {
    width: '47%',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  categoryName: {
    fontSize: FontSizes.md,
    ...Fonts.bold,
    color: Colors.text,
  },
  showcaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showcaseList: {
    gap: Spacing.md,
  },
  adCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  adImageContainer: {
    width: 120,
    height: 100,
    position: 'relative',
  },
  adImage: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adPriceBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  adPriceText: {
    color: '#FFF',
    fontSize: 10,
    ...Fonts.bold,
  },
  adInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  adTitle: {
    fontSize: FontSizes.sm,
    ...Fonts.bold,
    color: Colors.text,
    lineHeight: 20,
  },
  adFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adLocationText: {
    fontSize: 10,
    ...Fonts.medium,
    color: Colors.textTertiary,
  },
  adDateText: {
    fontSize: 10,
    ...Fonts.medium,
    color: Colors.textTertiary,
  },
});
