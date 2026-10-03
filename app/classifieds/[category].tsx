import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius, Shadows } from '@/constants/theme';
import SpringButton from '@/components/ui/SpringButton';
import { getApprovedClassifieds } from '@/services/classifieds';

const CATEGORY_NAMES: Record<string, string> = {
  'ikinci-el': '2. El Eşya',
  'is-ilanlari': 'İş İlanları',
};

export default function ClassifiedsCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'cheapest' | 'expensive'>('newest');

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const fetchedAds = await getApprovedClassifieds(category);
        setAds(fetchedAds);
      } catch (error) {
        console.error('Kategori ilanları çekilemedi', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [category]);

  const categoryName = CATEGORY_NAMES[category] || 'İlanlar';

  const sortedAds = [...ads].sort((a, b) => {
    if (sortOrder === 'cheapest') return Number(a.price) - Number(b.price);
    if (sortOrder === 'expensive') return Number(b.price) - Number(a.price);
    // newest (default)
    const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return dateB - dateA;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <SpringButton style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </SpringButton>
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loading ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : ads.length === 0 ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.borderLight, marginTop: Spacing.xl }}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={Colors.border} />
            <Text style={{ marginTop: Spacing.md, color: Colors.textSecondary, ...Fonts.medium }}>Bu kategoride henüz ilan bulunmuyor.</Text>
          </View>
        ) : (
          <View>
            {/* Sorting UI */}
            <View style={{ flexDirection: 'row', marginBottom: Spacing.md, gap: Spacing.sm }}>
              <SpringButton 
                style={[styles.sortButton, sortOrder === 'newest' && styles.sortButtonActive]}
                onPress={() => setSortOrder('newest')}
              >
                <Text style={[styles.sortButtonText, sortOrder === 'newest' && styles.sortButtonTextActive]}>En Yeni</Text>
              </SpringButton>
              <SpringButton 
                style={[styles.sortButton, sortOrder === 'cheapest' && styles.sortButtonActive]}
                onPress={() => setSortOrder('cheapest')}
              >
                <Text style={[styles.sortButtonText, sortOrder === 'cheapest' && styles.sortButtonTextActive]}>En Ucuz</Text>
              </SpringButton>
              <SpringButton 
                style={[styles.sortButton, sortOrder === 'expensive' && styles.sortButtonActive]}
                onPress={() => setSortOrder('expensive')}
              >
                <Text style={[styles.sortButtonText, sortOrder === 'expensive' && styles.sortButtonTextActive]}>En Pahalı</Text>
              </SpringButton>
            </View>

            <View style={styles.showcaseList}>
              {sortedAds.map((ad) => (
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
  content: {
    padding: Spacing.xl,
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
  sortButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortButtonText: {
    fontSize: 12,
    ...Fonts.bold,
    color: Colors.textSecondary,
  },
  sortButtonTextActive: {
    color: '#FFF',
  },
});
