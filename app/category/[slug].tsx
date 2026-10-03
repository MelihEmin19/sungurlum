import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius, Shadows } from '@/constants/theme';
import { Business } from '@/constants/mockData';
import { getCategoryBySlug } from '@/constants/categories';
import { getBusinessesByCategory } from '@/services/businesses';
import BusinessCard from '@/components/BusinessCard';
import SpringButton from '@/components/ui/SpringButton';

type FilterType = 'smart' | 'closest' | 'topRated' | 'openNow';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<FilterType>('smart');
  const [showFilters, setShowFilters] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const category = getCategoryBySlug(slug || '');

  useEffect(() => {
    const fetchBiz = async () => {
      if (slug) {
        const data = await getBusinessesByCategory(slug);
        setBusinesses(data);
      }
      setLoading(false);
    };
    fetchBiz();
  }, [slug]);
  
  // Apply Sort / Filter
  let filteredBusinesses = [...businesses];
  if (activeFilter === 'topRated') {
    filteredBusinesses.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (activeFilter === 'closest') {
    filteredBusinesses.reverse();
  } else if (activeFilter === 'smart') {
    filteredBusinesses.sort((a, b) => {
      if (a.membershipTier === 'premium' && b.membershipTier !== 'premium') return -1;
      if (b.membershipTier === 'premium' && a.membershipTier !== 'premium') return 1;
      return (b.rating || 0) - (a.rating || 0);
    });
  }

  if (!category) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Kategori bulunamadı</Text>
        <SpringButton onPress={() => router.back()} style={styles.backButtonError}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </SpringButton>
      </View>
    );
  }

  const FilterPill = ({ label, type, icon }: { label: string; type: FilterType; icon: string }) => {
    const isActive = activeFilter === type;
    return (
      <SpringButton 
        style={[styles.filterPill, isActive && styles.filterPillActive]} 
        onPress={() => {
          setActiveFilter(type);
          setShowFilters(false);
        }}
      >
        <MaterialCommunityIcons 
          name={icon as any} 
          size={16} 
          color={isActive ? Colors.primary : Colors.textSecondary} 
        />
        <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
          {label}
        </Text>
      </SpringButton>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <SpringButton style={styles.iconButton} onPress={() => router.back()} scaleTo={0.9}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </SpringButton>
        <View style={styles.headerTitleContainer}>
          <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '15' }]}>
            <MaterialCommunityIcons name={category.icon as any} size={20} color={category.color} />
          </View>
          <Text style={styles.headerTitle}>{category.name}</Text>
        </View>
        <SpringButton style={styles.iconButton} onPress={() => setShowFilters(!showFilters)} scaleTo={0.9}>
          <MaterialCommunityIcons 
            name={showFilters ? "close" : "tune-vertical"} 
            size={24} 
            color={showFilters ? Colors.primary : Colors.text} 
          />
        </SpringButton>
      </View>

      {/* Filter Menu Dropdown */}
      {showFilters && (
        <View style={styles.filterMenu}>
          <Text style={styles.filterMenuTitle}>Sıralama ve Filtreleme</Text>
          <View style={styles.filterOptions}>
            <FilterPill label="Akıllı Sıralama" type="smart" icon="star-shooting" />
            <FilterPill label="Bana En Yakın" type="closest" icon="map-marker-radius" />
            <FilterPill label="En Yüksek Puanlılar" type="topRated" icon="star" />
            <FilterPill label="Şu An Açık" type="openNow" icon="clock-outline" />
          </View>
        </View>
      )}

      {/* Business List */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            <Text style={styles.resultsCount}>{filteredBusinesses.length}</Text> esnaf bulundu
          </Text>
          {activeFilter !== 'smart' && (
            <View style={styles.activeFilterBadge}>
              <Text style={styles.activeFilterText}>
                {activeFilter === 'topRated' ? 'En Yüksek Puan' : 
                 activeFilter === 'closest' ? 'En Yakınlar' : 'Şu An Açık'}
              </Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : filteredBusinesses.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="store-search-outline" size={64} color={Colors.border} />
            <Text style={styles.emptyTitle}>Esnaf Bulunamadı</Text>
            <Text style={styles.emptySubtitle}>Bu kategoride henüz kayıtlı bir esnafımız bulunmuyor.</Text>
          </View>
        ) : (
          filteredBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: FontSizes.xl,
    ...Fonts.bold,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  backButtonError: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  backButtonText: {
    fontSize: FontSizes.md,
    ...Fonts.bold,
    color: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    zIndex: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    ...Fonts.bold,
    color: Colors.text,
  },
  filterMenu: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    ...Shadows.sm,
    zIndex: 10,
  },
  filterMenuTitle: {
    fontSize: FontSizes.sm,
    ...Fonts.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary + '30',
  },
  filterPillText: {
    fontSize: FontSizes.sm,
    ...Fonts.medium,
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    ...Fonts.bold,
    color: Colors.primary,
  },
  scrollContent: {
    padding: Spacing.xl,
    flexGrow: 1,
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  resultsText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    ...Fonts.medium,
  },
  resultsCount: {
    ...Fonts.bold,
    color: Colors.text,
  },
  activeFilterBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  activeFilterText: {
    fontSize: 10,
    ...Fonts.bold,
    color: '#FFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    ...Fonts.bold,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSizes.md,
    ...Fonts.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
