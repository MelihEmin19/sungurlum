import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  ActivityIndicator
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, Fonts, Shadows, BorderRadius } from '@/constants/theme';
import { MOCK_BUSINESSES } from '@/constants/mockData';
import { getCategoryById } from '@/constants/categories';
import SpringButton from '@/components/ui/SpringButton';
import { useAuthStore } from '@/stores/authStore';
import { toggleFavorite, checkIfFavorited } from '@/services/favorites';
import { submitReview, getBusinessReviews, Review } from '@/services/reviews';
import Skeleton from '@/components/ui/Skeleton';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';

import { getBusinessById } from '@/services/businesses';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// Mock Gallery Images for Demo
const MOCK_GALLERY = [
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?q=80&w=600&auto=format&fit=crop',
];

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const { isAuthenticated, user } = useAuthStore();

  const [business, setBusiness] = useState<any>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);

  const [isFav, setIsFav] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const coverAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(scrollY.value, [-100, 0, 100], [-50, 0, 30], Extrapolation.CLAMP),
        },
        {
          scale: interpolate(scrollY.value, [-100, 0], [1.5, 1], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const blurAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, 150], [0, 1], Extrapolation.CLAMP),
    };
  });

  useEffect(() => {
    const fetchBusiness = async () => {
      if (id) {
        const data = await getBusinessById(id as string);
        setBusiness(data);
      }
      setLoadingBusiness(false);
    };
    fetchBusiness();
  }, [id]);

  const category = business ? getCategoryById(business.category) : undefined;

  useEffect(() => {
    if (user && business) {
      checkIfFavorited(user.uid, business.id).then(setIsFav);
    }
  }, [user, business]);

  useEffect(() => {
    if (business) {
      const fetchReviews = async () => {
        const fetched = await getBusinessReviews(business.id);
        setReviews(fetched);
        setLoadingReviews(false);
      };
      fetchReviews();
    }
  }, [business]);

  if (loadingBusiness) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingHorizontal: 20 }]}>
        <View style={{ height: 200, width: '100%', borderRadius: 20, overflow: 'hidden', marginTop: 10 }}>
          <Skeleton height="100%" width="100%" />
        </View>
        <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Skeleton width="60%" height={30} />
          <Skeleton width="20%" height={30} />
        </View>
        <Skeleton width="40%" height={15} style={{ marginTop: 10 }} />
        
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
          <Skeleton width={100} height={35} borderRadius={20} />
          <Skeleton width={80} height={35} borderRadius={20} />
          <Skeleton width={120} height={35} borderRadius={20} />
        </View>

        <View style={{ marginTop: 30 }}>
          <Skeleton width="100%" height={80} borderRadius={15} style={{ marginBottom: 15 }} />
          <Skeleton width="100%" height={80} borderRadius={15} style={{ marginBottom: 15 }} />
          <Skeleton width="100%" height={80} borderRadius={15} />
        </View>
      </View>
    );
  }

  if (!business) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.notFoundText}>İşletme bulunamadı</Text>
        <SpringButton onPress={() => router.back()} style={styles.goBackButton}>
          <Text style={styles.goBackText}>Geri Dön</Text>
        </SpringButton>
      </View>
    );
  }

  const handleFavorite = async () => {
    if (!isAuthenticated || !user) {
      Alert.alert('Giriş Yapın', 'Favorilere eklemek için giriş yapmalısınız.', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Giriş Yap', onPress: () => router.push('/auth/login') }
      ]);
      return;
    }
    
    // Optimistic UI update
    const newValue = !isFav;
    setIsFav(newValue);
    try {
      await toggleFavorite(user.uid, business.id, 'business');
    } catch (error) {
      // Revert if error
      setIsFav(!newValue);
      Alert.alert('Hata', 'Favori işlemi başarısız oldu.');
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated || !user) {
      Alert.alert('Giriş Yapın', 'Yorum yapmak için giriş yapmalısınız.', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Giriş Yap', onPress: () => router.push('/auth/login') }
      ]);
      return;
    }

    if (reviewText.trim().length < 5) {
      Alert.alert('Hata', 'Lütfen biraz daha detaylı bir yorum yazın.');
      return;
    }

    try {
      await submitReview({
        businessId: business.id,
        userId: user.uid,
        userName: user.displayName || 'Kullanıcı',
        rating,
        comment: reviewText,
      });

      setReviewText('');
      setRating(5);
      
      // Refresh reviews
      const fetched = await getBusinessReviews(business.id);
      setReviews(fetched);
      
      Alert.alert('Başarılı', 'Yorumunuz eklendi.');
    } catch (error) {
      Alert.alert('Hata', 'Yorum eklenirken bir sorun oluştu.');
    }
  };

  const openGallery = (index: number) => {
    setActiveImageIndex(index);
    setGalleryVisible(true);
  };

  const renderStars = (currentRating: number, size = 16, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        interactive ? (
          <SpringButton key={i} onPress={() => setRating(i)} scaleTo={0.8}>
            <MaterialCommunityIcons
              name={i <= currentRating ? 'star' : 'star-outline'}
              size={size}
              color={i <= currentRating ? Colors.star : Colors.border}
            />
          </SpringButton>
        ) : (
          <MaterialCommunityIcons
            key={i}
            name={i <= currentRating ? 'star' : 'star-outline'}
            size={size}
            color={i <= currentRating ? Colors.star : Colors.border}
          />
        )
      );
    }
    return <View style={styles.starsRow}>{stars}</View>;
  };



  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header Overlay */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top }]}>
        <SpringButton style={styles.iconButton} onPress={() => router.back()} scaleTo={0.9}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </SpringButton>
        <SpringButton style={styles.iconButton} onPress={handleFavorite} scaleTo={0.8}>
          <MaterialCommunityIcons 
            name={isFav ? "heart" : "heart-outline"} 
            size={24} 
            color={isFav ? Colors.primary : Colors.text} 
          />
        </SpringButton>
      </View>

      <Animated.ScrollView 
        showsVerticalScrollIndicator={false} 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Cover Bento */}
        {business.coverImage ? (
          <Animated.View style={[styles.coverContainer, coverAnimatedStyle]}>
            <Image source={{ uri: business.coverImage }} style={[StyleSheet.absoluteFill, { borderBottomLeftRadius: BorderRadius.xxl, borderBottomRightRadius: BorderRadius.xxl }]} resizeMode="cover" />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)', borderBottomLeftRadius: BorderRadius.xxl, borderBottomRightRadius: BorderRadius.xxl }]} />
            <AnimatedBlurView intensity={60} style={[StyleSheet.absoluteFill, { borderBottomLeftRadius: BorderRadius.xxl, borderBottomRightRadius: BorderRadius.xxl }, blurAnimatedStyle]} tint="dark" />
            {business.membershipTier === 'premium' && (
              <View style={styles.premiumBadge}>
                <MaterialCommunityIcons name="crown" size={16} color="#FBBF24" />
                <Text style={styles.premiumText}>Premium İşletme</Text>
              </View>
            )}
          </Animated.View>
        ) : (
          <Animated.View style={[styles.coverContainer, { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.borderLight }, coverAnimatedStyle]}>
            <MaterialCommunityIcons
              name={(category?.icon as any) || 'store'}
              size={100}
              color={Colors.border}
              style={styles.coverIcon}
            />
            {business.membershipTier === 'premium' && (
              <View style={styles.premiumBadge}>
                <MaterialCommunityIcons name="crown" size={16} color="#FBBF24" />
                <Text style={styles.premiumText}>Premium İşletme</Text>
              </View>
            )}
          </Animated.View>
        )}

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.businessName}>{business.name}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{business.rating}</Text>
              <MaterialCommunityIcons name="star" size={14} color={Colors.star} />
            </View>
          </View>
          
          <Text style={styles.categoryText}>
            {category?.name} {business.subcategory ? `• ${business.subcategory.replace('-', ' ')}` : ''}
          </Text>

          {/* Delivery Call to Action */}
          <SpringButton style={styles.deliveryBento} onPress={() => {
            router.push({ pathname: '/business/order', params: { businessId: business.id } });
          }}>
            <View style={styles.deliveryIconWrapper}>
              <MaterialCommunityIcons name="moped" size={28} color={Colors.primary} />
            </View>
            <View style={styles.deliveryTextWrapper}>
              <Text style={styles.deliveryTitle}>Evinden Çıkma, Biz Getirelim!</Text>
              <Text style={styles.deliverySubtitle}>Bu esnaftan ne istersen anında kapında.</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.textSecondary} />
          </SpringButton>

          {/* Action Bento */}
          <View style={styles.actionBento}>
            <SpringButton style={styles.actionItem} scaleTo={0.9}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.success + '15' }]}>
                <MaterialCommunityIcons name="phone" size={24} color={Colors.success} />
              </View>
              <Text style={styles.actionText}>Ara</Text>
            </SpringButton>

            {business.whatsapp && (
              <SpringButton style={styles.actionItem} scaleTo={0.9}>
                <View style={[styles.actionIcon, { backgroundColor: '#25D36615' }]}>
                  <MaterialCommunityIcons name="whatsapp" size={24} color="#25D366" />
                </View>
                <Text style={styles.actionText}>WhatsApp</Text>
              </SpringButton>
            )}

            <SpringButton style={styles.actionItem} scaleTo={0.9} onPress={() => router.push('/map')}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.info + '15' }]}>
                <MaterialCommunityIcons name="map-marker" size={24} color={Colors.info} />
              </View>
              <Text style={styles.actionText}>Harita</Text>
            </SpringButton>
          </View>

          {/* Gallery Preview Section */}
          {((business.gallery && business.gallery.length > 0) || MOCK_GALLERY.length > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fotoğraflar</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryPreviewScroll}>
                {(business.gallery && business.gallery.length > 0 ? business.gallery : MOCK_GALLERY).map((url: string, index: number) => (
                  <SpringButton key={index} style={styles.galleryPreviewItem} onPress={() => openGallery(index)} scaleTo={0.95}>
                    <Image source={{ uri: url }} style={styles.previewImage} />
                  </SpringButton>
                ))}
              </ScrollView>
            </View>
          )}

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hakkında</Text>
            <Text style={styles.descriptionText}>{business.description}</Text>
          </View>

          {/* Address Box */}
          <View style={styles.addressBox}>
            <View style={styles.addressIconWrapper}>
              <MaterialCommunityIcons name="map-marker-radius" size={24} color={Colors.textTertiary} />
            </View>
            <View style={styles.addressTextWrapper}>
              <Text style={styles.addressLabel}>Adres</Text>
              <Text style={styles.addressValue}>{business.address}</Text>
            </View>
          </View>

          {/* Reviews Section */}
          <View style={styles.section}>
            <View style={styles.reviewHeader}>
              <Text style={styles.sectionTitle}>Değerlendirmeler</Text>
              <Text style={styles.reviewCountText}>{reviews.length} Yorum</Text>
            </View>

            <View style={styles.writeReviewBento}>
              {!isAuthenticated ? (
                <View style={styles.unauthReviewBox}>
                  <Text style={styles.unauthReviewText}>Deneyiminizi paylaşmak için giriş yapın.</Text>
                  <SpringButton style={styles.loginToReviewButton} onPress={() => router.push('/auth/login')}>
                    <Text style={styles.loginToReviewButtonText}>Giriş Yap</Text>
                  </SpringButton>
                </View>
              ) : (
                <View style={styles.authReviewBox}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>{user?.displayName?.charAt(0)}</Text>
                  </View>
                  <View style={styles.reviewForm}>
                    {renderStars(rating, 24, true)}
                    <TextInput
                      style={styles.reviewInput}
                      placeholder="Bu esnaf hakkında ne düşünüyorsunuz?"
                      placeholderTextColor={Colors.textTertiary}
                      value={reviewText}
                      onChangeText={setReviewText}
                      multiline
                    />
                    <SpringButton style={styles.submitReviewButton} onPress={handleSubmitReview}>
                      <Text style={styles.submitReviewText}>Gönder</Text>
                    </SpringButton>
                  </View>
                </View>
              )}
            </View>

            {reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewCardHeader}>
                  <View style={styles.reviewerAvatar}>
                    <Text style={styles.reviewerAvatarText}>{review.userName.charAt(0)}</Text>
                  </View>
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{review.userName}</Text>
                    <Text style={styles.reviewDate}>
                      {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString('tr-TR') : 'Yeni'}
                    </Text>
                  </View>
                  {renderStars(review.rating, 14)}
                </View>
                <Text style={styles.reviewCardText}>{review.comment}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </View>
      </Animated.ScrollView>

      {/* Full Screen Gallery Modal */}
      <Modal visible={galleryVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <SpringButton 
            style={[styles.closeButton, { top: insets.top + Spacing.md }]} 
            onPress={() => setGalleryVisible(false)}
          >
            <MaterialCommunityIcons name="close" size={28} color="#FFF" />
          </SpringButton>
          
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: activeImageIndex * SCREEN_WIDTH, y: 0 }}
          >
            {(business.gallery && business.gallery.length > 0 ? business.gallery : MOCK_GALLERY).map((url: string, index: number) => (
              <View key={index} style={styles.fullScreenImageContainer}>
                <Image 
                  source={{ uri: url }} 
                  style={styles.fullScreenImage} 
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  notFoundText: { fontSize: FontSizes.lg, ...Fonts.bold, color: Colors.text, marginBottom: Spacing.md },
  goBackButton: { padding: Spacing.md, backgroundColor: Colors.surface, borderRadius: BorderRadius.md },
  goBackText: { fontSize: FontSizes.md, ...Fonts.bold, color: Colors.primary },
  headerOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm, zIndex: 10,
  },
  iconButton: {
    width: 44, height: 44, borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    ...Shadows.sm,
  },
  coverContainer: {
    height: 300, width: '100%', alignItems: 'center', justifyContent: 'center',
    position: 'relative', borderBottomLeftRadius: BorderRadius.xxl, borderBottomRightRadius: BorderRadius.xxl,
  },
  coverIcon: { marginTop: 40 },
  premiumBadge: {
    position: 'absolute', bottom: Spacing.xl, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: BorderRadius.full, gap: 6,
  },
  premiumText: { fontSize: FontSizes.xs, ...Fonts.extraBold, color: '#FBBF24', letterSpacing: 0.5 },
  content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.sm },
  businessName: { flex: 1, fontSize: FontSizes.hero, ...Fonts.extraBold, color: Colors.text, letterSpacing: -1, lineHeight: 38 },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.warningLight,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.full, gap: 4, marginTop: 4,
  },
  ratingText: { fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.warning },
  categoryText: { fontSize: FontSizes.md, color: Colors.textSecondary, ...Fonts.semiBold, marginTop: Spacing.xs, textTransform: 'capitalize' },
  deliveryBento: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    padding: Spacing.lg, borderRadius: BorderRadius.xl, marginTop: Spacing.xl,
    borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.sm
  },
  deliveryIconWrapper: {
    width: 48, height: 48, borderRadius: BorderRadius.lg, backgroundColor: Colors.primary + '15',
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  deliveryTextWrapper: { flex: 1 },
  deliveryTitle: { fontSize: FontSizes.md, ...Fonts.extraBold, color: Colors.text, marginBottom: 2, letterSpacing: -0.3 },
  deliverySubtitle: { fontSize: FontSizes.sm, ...Fonts.medium, color: Colors.textSecondary },
  actionBento: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xl, gap: Spacing.md },
  actionItem: {
    flex: 1, alignItems: 'center', backgroundColor: Colors.surface, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.sm,
  },
  actionIcon: { width: 48, height: 48, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  actionText: { fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.text },
  section: { marginTop: Spacing.xxl },
  sectionTitle: { fontSize: FontSizes.xl, ...Fonts.extraBold, color: Colors.text, letterSpacing: -0.5, marginBottom: Spacing.md },
  galleryPreviewScroll: { paddingRight: Spacing.xl, gap: Spacing.md },
  galleryPreviewItem: { width: 120, height: 120, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  descriptionText: { fontSize: FontSizes.md, color: Colors.textSecondary, ...Fonts.medium, lineHeight: 24 },
  addressBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    padding: Spacing.lg, borderRadius: BorderRadius.xl, marginTop: Spacing.xl,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  addressIconWrapper: { width: 44, height: 44, borderRadius: BorderRadius.lg, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  addressTextWrapper: { flex: 1 },
  addressLabel: { fontSize: FontSizes.xs, ...Fonts.bold, color: Colors.textTertiary, marginBottom: 2 },
  addressValue: { fontSize: FontSizes.sm, ...Fonts.semiBold, color: Colors.text, lineHeight: 20 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: Spacing.md },
  reviewCountText: { fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.primary, marginBottom: 4 },
  writeReviewBento: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.borderLight, marginBottom: Spacing.xl, overflow: 'hidden' },
  unauthReviewBox: { padding: Spacing.xl, alignItems: 'center' },
  unauthReviewText: { fontSize: FontSizes.sm, ...Fonts.medium, color: Colors.textSecondary, marginBottom: Spacing.md },
  loginToReviewButton: { backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  loginToReviewButtonText: { fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.primary },
  authReviewBox: { padding: Spacing.md, flexDirection: 'row', gap: Spacing.md },
  reviewAvatar: { width: 40, height: 40, borderRadius: BorderRadius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { color: '#FFF', ...Fonts.bold, fontSize: FontSizes.md },
  reviewForm: { flex: 1 },
  starsRow: { flexDirection: 'row', gap: 4, marginBottom: Spacing.sm },
  reviewInput: {
    backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: Spacing.md,
    minHeight: 80, fontSize: FontSizes.sm, ...Fonts.medium, color: Colors.text, textAlignVertical: 'top',
    ...Platform.select({ web: { outlineStyle: 'none' as any } }),
  },
  submitReviewButton: { alignSelf: 'flex-end', backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: 8, borderRadius: BorderRadius.md, marginTop: Spacing.sm },
  submitReviewText: { color: '#FFF', fontSize: FontSizes.sm, ...Fonts.bold },
  reviewCard: { backgroundColor: Colors.surface, padding: Spacing.lg, borderRadius: BorderRadius.xl, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight },
  reviewCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  reviewerAvatar: { width: 36, height: 36, borderRadius: BorderRadius.full, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  reviewerAvatarText: { fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.textSecondary },
  reviewerInfo: { flex: 1 },
  reviewerName: { fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.text },
  reviewDate: { fontSize: 10, ...Fonts.medium, color: Colors.textTertiary },
  reviewCardText: { fontSize: FontSizes.sm, ...Fonts.medium, color: Colors.textSecondary, lineHeight: 20 },
  
  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' },
  closeButton: { position: 'absolute', right: Spacing.xl, zIndex: 100, padding: Spacing.sm },
  fullScreenImageContainer: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  fullScreenImage: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.8 },
});
