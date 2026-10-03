import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, Fonts, Shadows, BorderRadius } from '@/constants/theme';
import { getCategories } from '@/services/categories';
import { Category } from '@/constants/categories';
import SpringButton from '@/components/ui/SpringButton';
import { useAuthStore } from '@/stores/authStore';
import { Icon } from '@/components/ui/Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const { isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kategoriler</Text>
        <Text style={styles.headerSubtitle}>Tüm hizmet kategorileri</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => router.push(`/category/${category.slug}` as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.categoryIcon, { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderLight }]}>
              <MaterialCommunityIcons
                name={category.icon as any}
                size={28}
                color={Colors.primary}
              />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.subcategoryText} numberOfLines={1}>
                {category.subcategories.map((s) => s.name).join(', ')}
              </Text>
            </View>
            <View style={styles.categoryRight}>
              <View style={[styles.countBadge, { backgroundColor: Colors.primary }]}>
                <Text style={[styles.countText, { color: '#FFFFFF' }]}>
                  {category.subcategories.length}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={Colors.textTertiary}
              />
            </View>
          </TouchableOpacity>
        ))}

        <SpringButton 
          style={{ 
            marginTop: Spacing.xl, 
            marginBottom: Spacing.xl,
            backgroundColor: Colors.primary,
            padding: Spacing.lg,
            borderRadius: BorderRadius.xl,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5
          }}
          onPress={() => {
            if (!isAuthenticated) {
              Alert.alert('Giriş Yapın', 'Esnaf profili oluşturmak için giriş yapın.', [{ text: 'İptal', style: 'cancel' }, { text: 'Giriş Yap', onPress: () => router.push('/auth/login') }]);
            } else {
              router.push('/apply/business' as any);
            }
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md }}>
              <MaterialCommunityIcons name="store-plus" size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: FontSizes.md, ...Fonts.bold, color: '#FFFFFF', marginBottom: 2 }}>Esnaf Mısınız?</Text>
              <Text style={{ fontSize: FontSizes.xs, ...Fonts.medium, color: 'rgba(255,255,255,0.8)' }}>Hemen Ücretsiz Başvurun</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
        </SpringButton>

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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    ...Fonts.extraBold,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: FontSizes.md,
    ...Fonts.semiBold,
    color: Colors.text,
    marginBottom: 2,
  },
  subcategoryText: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  countText: {
    fontSize: FontSizes.xs,
    ...Fonts.bold,
  },
  bottomSpacer: {
    height: 32,
  },
});
