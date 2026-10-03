import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius, Shadows } from '@/constants/theme';
import SpringButton from '@/components/ui/SpringButton';
import { useAuthStore } from '@/stores/authStore';
import { getClassifiedById } from '@/services/classifieds';
import { toggleFavorite, checkIfFavorited } from '@/services/favorites';

const { width } = Dimensions.get('window');

export default function ClassifiedDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { isAuthenticated, user } = useAuthStore();
  const [ad, setAd] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [isFav, setIsFav] = React.useState(false);

  React.useEffect(() => {
    const fetchAd = async () => {
      try {
        const data = await getClassifiedById(id as string);
        setAd(data);
      } catch (error) {
        console.error('Error loading ad', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAd();
  }, [id]);

  React.useEffect(() => {
    if (user && ad) {
      checkIfFavorited(user.uid, ad.id).then(setIsFav);
    }
  }, [user, ad]);

  const handleFavorite = async () => {
    if (!isAuthenticated || !user) {
      Alert.alert('Giriş Yapın', 'Favorilere eklemek için giriş yapmalısınız.', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Giriş Yap', onPress: () => router.push('/auth/login') }
      ]);
      return;
    }
    
    const newValue = !isFav;
    setIsFav(newValue);
    try {
      await toggleFavorite(user.uid, ad.id, 'classified');
    } catch (error) {
      setIsFav(!newValue);
      Alert.alert('Hata', 'Favori işlemi başarısız oldu.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  if (!ad) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>İlan bulunamadı.</Text>
        <SpringButton onPress={() => router.back()}><Text>Geri</Text></SpringButton>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.headerOverlay, { paddingTop: insets.top }]}>
        <SpringButton style={styles.iconButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </SpringButton>
        <SpringButton style={styles.iconButton} onPress={handleFavorite}>
          <MaterialCommunityIcons 
            name={isFav ? "heart" : "heart-outline"} 
            size={24} 
            color={isFav ? Colors.primary : Colors.text} 
          />
        </SpringButton>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {ad.images && ad.images.length > 0 ? (
            <Image source={{ uri: ad.images[0] }} style={styles.mainImage} />
          ) : (
            <View style={[styles.mainImage, styles.noImage]}>
              <MaterialCommunityIcons name="image-outline" size={64} color={Colors.border} />
              <Text style={{ marginTop: 10, color: Colors.textSecondary }}>Fotoğraf Yok</Text>
            </View>
          )}
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{ad.price}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{ad.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="map-marker" size={16} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{ad.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.metaText}>
                {ad.createdAt?.toDate ? ad.createdAt.toDate().toLocaleDateString('tr-TR') : 'Yeni'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="tag-outline" size={16} color={Colors.textSecondary} />
              <Text style={[styles.metaText, { textTransform: 'uppercase' }]}>{ad.category}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Seller Info */}
          <View style={styles.sellerBento}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerAvatarText}>{ad.userName?.charAt(0) || 'K'}</Text>
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerLabel}>İlan Sahibi</Text>
              <Text style={styles.sellerName}>{ad.userName || 'Kullanıcı'}</Text>
            </View>
            <SpringButton style={styles.callButton}>
              <MaterialCommunityIcons name="phone" size={20} color="#FFF" />
              <Text style={styles.callButtonText}>Ara</Text>
            </SpringButton>
          </View>

          <Text style={styles.sectionTitle}>İlan Açıklaması</Text>
          <Text style={styles.description}>{ad.description}</Text>

          {/* Safety Warning */}
          <View style={styles.safetyBox}>
            <MaterialCommunityIcons name="shield-alert-outline" size={24} color={Colors.warning} />
            <Text style={styles.safetyText}>
              Güvenliğiniz için tanımadığınız kişilere kesinlikle kapora veya ön ödeme göndermeyin.
            </Text>
          </View>
          
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
      
      {/* Sticky Action Footer */}
      <View style={[styles.stickyFooter, { paddingBottom: insets.bottom || Spacing.md }]}>
        <SpringButton style={styles.messageButton}>
          <MaterialCommunityIcons name="chat-processing-outline" size={24} color={Colors.primary} />
          <Text style={styles.messageText}>Mesaj At</Text>
        </SpringButton>
        <SpringButton style={styles.mainCallButton}>
          <MaterialCommunityIcons name="phone" size={24} color="#FFF" />
          <Text style={styles.mainCallText}>Hemen Ara</Text>
        </SpringButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  imageContainer: {
    width: width,
    height: width * 0.75,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceBadge: {
    position: 'absolute',
    bottom: -20,
    right: Spacing.xl,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  priceText: {
    fontSize: FontSizes.xl,
    ...Fonts.extraBold,
    color: '#FFF',
  },
  content: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  title: {
    fontSize: FontSizes.xl,
    ...Fonts.extraBold,
    color: Colors.text,
    lineHeight: 28,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FontSizes.sm,
    ...Fonts.medium,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.lg,
  },
  sellerBento: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.xl,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  sellerAvatarText: {
    fontSize: FontSizes.lg,
    ...Fonts.bold,
    color: Colors.textSecondary,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerLabel: {
    fontSize: 10,
    ...Fonts.bold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },
  sellerName: {
    fontSize: FontSizes.md,
    ...Fonts.bold,
    color: Colors.text,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  callButtonText: {
    color: '#FFF',
    ...Fonts.bold,
    fontSize: FontSizes.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    ...Fonts.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSizes.md,
    ...Fonts.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.xxl,
  },
  safetyBox: {
    flexDirection: 'row',
    backgroundColor: Colors.warningLight,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  safetyText: {
    flex: 1,
    fontSize: FontSizes.sm,
    ...Fonts.bold,
    color: Colors.warning,
    lineHeight: 20,
  },
  stickyFooter: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.md,
    ...Shadows.lg,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    height: 50,
    borderRadius: BorderRadius.lg,
    gap: 8,
  },
  messageText: {
    fontSize: FontSizes.md,
    ...Fonts.bold,
    color: Colors.primary,
  },
  mainCallButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: BorderRadius.lg,
    gap: 8,
  },
  mainCallText: {
    fontSize: FontSizes.md,
    ...Fonts.bold,
    color: '#FFF',
  },
});
