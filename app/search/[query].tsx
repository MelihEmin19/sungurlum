import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius } from '@/constants/theme';
import { MOCK_BUSINESSES } from '@/constants/mockData';
import { searchCategories } from '@/constants/categories';
import SearchBar from '@/components/SearchBar';
import BusinessCard from '@/components/BusinessCard';

export default function SearchResultsScreen() {
  const { query } = useLocalSearchParams<{ query: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const decodedQuery = decodeURIComponent(query || '');

  // Simple search in mock data
  const results = MOCK_BUSINESSES.filter((b) => {
    const lowerQuery = decodedQuery.toLowerCase();
    return (
      b.status === 'approved' &&
      (b.name.toLowerCase().includes(lowerQuery) ||
        b.description.toLowerCase().includes(lowerQuery) ||
        b.category.toLowerCase().includes(lowerQuery) ||
        b.subcategory.toLowerCase().includes(lowerQuery))
    );
  });

  // Also search categories
  const matchedCategories = searchCategories(decodedQuery);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.searchBarContainer}>
          <SearchBar autoFocus={false} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Query */}
        <Text style={styles.searchInfo}>
          "<Text style={styles.searchQuery}>{decodedQuery}</Text>" için arama sonuçları
        </Text>

        {/* Matched Categories */}
        {matchedCategories.length > 0 && (
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionLabel}>İlgili Kategoriler</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {matchedCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryChip}
                  onPress={() => router.push(`/category/${cat.slug}` as any)}
                >
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={16}
                    color={cat.color}
                  />
                  <Text style={[styles.categoryChipText, { color: cat.color }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Results */}
        <Text style={styles.resultsCount}>
          {results.length} sonuç bulundu
        </Text>

        {results.length > 0 ? (
          results.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="magnify" size={48} color={Colors.border} />
            <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
            <Text style={styles.emptyDescription}>
              "{decodedQuery}" ile eşleşen esnaf bulunamadı.{'\n'}
              Farklı anahtar kelimeler deneyin.
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
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
    paddingLeft: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.md,
  },
  searchInfo: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchQuery: {
    ...Fonts.semiBold,
    color: Colors.text,
  },
  categoriesSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: FontSizes.sm,
    ...Fonts.semiBold,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipText: {
    fontSize: FontSizes.sm,
    ...Fonts.semiBold,
  },
  resultsCount: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxxl,
    paddingHorizontal: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    ...Fonts.semiBold,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 32,
  },
});
