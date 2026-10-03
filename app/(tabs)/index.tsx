import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import SearchBar from '@/components/SearchBar';
import CampaignCarousel from '@/components/CampaignCarousel';
import CategoryGrid from '@/components/CategoryGrid';
import BusinessCard from '@/components/BusinessCard';
import { getBusinesses } from '@/services/businesses';
import { Business } from '@/constants/mockData';
import SpringButton from '@/components/ui/SpringButton';
import { useAuthStore } from '@/stores/authStore';
import { Icon } from '@/components/ui/Icon';
import Skeleton from '@/components/ui/Skeleton';
import StaggerItem from '@/components/ui/StaggerItem';
import ShimmerBorder from '@/components/ui/ShimmerBorder';
import EmptyState from '@/components/ui/EmptyState';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Parallax scroll value
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Parallax header animation
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 120], [1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, 120], [0, -20], Extrapolation.CLAMP);
    
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const { businesses: fetchedBusinesses } = await getBusinesses();
        const approved = fetchedBusinesses.filter(b => b.status === 'approved');
        setAllBusinesses(approved);
        setFeaturedBusinesses(approved.filter(b => b.isFeatured));
      } catch (error) {
        console.error('Error loading businesses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBusinesses();
  }, []);

  // Memoize filtered search results
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return allBusinesses.filter(b => 
      b.name.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)
    );
  }, [searchQuery, allBusinesses]);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <AnimatedScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 32 }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <StaggerItem index={0} initialDelay={0} direction="down" distance={10}>
            <View className="flex-row justify-between items-center mb-5">
              <SpringButton 
                className="flex-row items-center bg-surface px-4 py-2 rounded-full border border-border/30"
                scaleTo={0.92}
                onPress={() => router.push('/map' as any)}
              >
                <Icon name="mapPin" size={16} color="primary" />
                <Text className="text-sm font-bold text-textPrimary ml-1.5 mr-1.5">Sungurlu</Text>
                <Icon name="chevronDown" size={16} color="textTertiary" />
              </SpringButton>
              
              <View className="flex-row gap-2">
                <SpringButton 
                  className="w-11 h-11 rounded-full bg-surface items-center justify-center relative border border-border/30"
                  onPress={() => router.push('/notifications' as any)}
                >
                  <Icon name="bell" size={22} color="textPrimary" />
                  <View className="absolute top-2.5 right-3 w-2 h-2 rounded-full bg-danger border-[1.5px] border-surface" />
                </SpringButton>
              </View>
            </View>
          </StaggerItem>
        </View>

        {/* Hero Title with Parallax */}
        <Animated.View style={[{ paddingHorizontal: 24, marginBottom: 20 }, headerAnimatedStyle]}>
          <Text style={{
            fontSize: 32,
            fontWeight: '800',
            color: Colors.text,
            letterSpacing: -0.8,
            lineHeight: 40,
          }}>
            İhtiyacın olan her şey, <Text style={{ color: Colors.primary }}>tek dokunuşla.</Text>
          </Text>
        </Animated.View>

        {/* Search Bar */}
        <StaggerItem index={1} initialDelay={200}>
          <View className="mb-6">
            <SearchBar 
              placeholder="Esnaf, kategori veya hizmet ara..." 
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </StaggerItem>

        {searchQuery.length > 0 ? (
          <View className="px-5 gap-3 mt-2 mb-8">
            <Text className="text-lg font-bold text-textSecondary mb-2">Arama Sonuçları</Text>
            {searchResults.length > 0 ? (
              searchResults.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))
            ) : (
              <EmptyState
                variant="search"
                title="Sonuç Bulunamadı"
                description={`"${searchQuery}" ile eşleşen esnaf veya hizmet bulunamadı. Farklı anahtar kelimeler deneyin.`}
                actionLabel="Aramayı Temizle"
                onAction={() => setSearchQuery('')}
              />
            )}
          </View>
        ) : (
          <>
        {/* KAHRAMAN MODÜLLER */}
        <View className="px-5 mb-6 gap-4">
          {/* Sanal Market */}
          <StaggerItem index={0} initialDelay={100} delay={80}>
            <ShimmerBorder color="#35B978" borderRadius={24}>
              <SpringButton 
                className="w-full h-[160px] justify-center rounded-3xl p-5 overflow-hidden bg-surface"
                onPress={() => router.push('/market' as any)}
                scaleTo={0.97}
              >
                <View className="absolute right-[-20px] bottom-[-20px] w-40 h-40 rounded-full" style={{ backgroundColor: 'rgba(53,185,120,0.06)' }} />
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-4">
                    <View className="self-start px-3 py-1 rounded-full mb-3 flex-row items-center" style={{ backgroundColor: '#E6F7EF' }}>
                      <Icon name="zap" size={12} color="#35B978" />
                      <Text style={{ color: '#35B978' }} className="font-bold text-xs ml-1">DAKİKALAR İÇİNDE</Text>
                    </View>
                    <Text className="text-[24px] font-extrabold text-textPrimary mb-1">Sanal Market</Text>
                    <Text className="text-sm font-medium text-textSecondary leading-5">Market, su ve temel ihtiyaçlarınız anında kapınızda.</Text>
                  </View>
                  <View className="w-[72px] h-[72px] rounded-[20px] items-center justify-center relative" style={{ backgroundColor: '#35B978' }}>
                    <Icon name="shoppingCart" size={32} color="#FFFFFF" />
                  </View>
                </View>
              </SpringButton>
            </ShimmerBorder>
          </StaggerItem>

          {/* Yemek Siparişi */}
          <StaggerItem index={1} initialDelay={100} delay={80}>
            <ShimmerBorder color="#FF8A3D" borderRadius={24}>
              <SpringButton 
                className="w-full h-[160px] justify-center rounded-3xl p-5 overflow-hidden bg-surface"
                onPress={() => router.push('/restaurants' as any)}
                scaleTo={0.97}
              >
                <View className="absolute right-[-20px] bottom-[-20px] w-40 h-40 rounded-full" style={{ backgroundColor: 'rgba(255,138,61,0.06)' }} />
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-4">
                    <View className="self-start px-3 py-1 rounded-full mb-3 flex-row items-center" style={{ backgroundColor: '#FFF0E6' }}>
                      <Icon name="zap" size={12} color="#FF8A3D" />
                      <Text style={{ color: '#FF8A3D' }} className="font-bold text-xs ml-1">SICACIK TESLİMAT</Text>
                    </View>
                    <Text className="text-[24px] font-extrabold text-textPrimary mb-1">Yemek Siparişi</Text>
                    <Text className="text-sm font-medium text-textSecondary leading-5">Yerel restoranlardan en lezzetli sıcak yemekler.</Text>
                  </View>
                  <View className="w-[72px] h-[72px] rounded-[20px] items-center justify-center relative" style={{ backgroundColor: '#FF8A3D' }}>
                    <Icon name="pizza" size={32} color="#FFFFFF" />
                  </View>
                </View>
              </SpringButton>
            </ShimmerBorder>
          </StaggerItem>

          {/* Şehir Portalı */}
          <StaggerItem index={2} initialDelay={100} delay={80}>
            <ShimmerBorder color="#38C0BC" borderRadius={24}>
              <SpringButton 
                className="w-full h-[160px] justify-center rounded-3xl p-5 overflow-hidden bg-surface"
                onPress={() => router.push('/city-portal' as any)}
                scaleTo={0.97}
              >
                <View className="absolute right-[-20px] bottom-[-20px] w-40 h-40 rounded-full" style={{ backgroundColor: 'rgba(56,192,188,0.06)' }} />
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-4">
                    <View className="self-start px-3 py-1 rounded-full mb-3 flex-row items-center" style={{ backgroundColor: '#E6F7F6' }}>
                      <Icon name="sparkles" size={12} color="#38C0BC" />
                      <Text style={{ color: '#38C0BC' }} className="font-bold text-xs ml-1">HER ŞEY BURADA</Text>
                    </View>
                    <Text className="text-[24px] font-extrabold text-textPrimary mb-1">Şehir Portalı</Text>
                    <Text className="text-sm font-medium text-textSecondary leading-5">Yerel esnaflar, 2.el ürünler ve iş ilanları.</Text>
                  </View>
                  <View className="w-[72px] h-[72px] rounded-[20px] items-center justify-center relative" style={{ backgroundColor: '#38C0BC' }}>
                    <Icon name="store" size={32} color="#FFFFFF" />
                  </View>
                </View>
              </SpringButton>
            </ShimmerBorder>
          </StaggerItem>
        </View>

        {/* Campaign Carousel */}
        <StaggerItem index={3} initialDelay={300}>
          <CampaignCarousel />
        </StaggerItem>

        {/* Category Grid */}
        <CategoryGrid maxItems={8} />

        {/* Featured Businesses */}
        <View className="flex-row justify-between items-end px-6 mt-8 mb-4">
          <Text className="text-[22px] font-extrabold text-textPrimary tracking-tight">Gözdeler</Text>
          <SpringButton scaleTo={0.9}>
            <Text className="text-base font-bold text-primary">Tümü</Text>
          </SpringButton>
        </View>

        {isLoading ? (
          <View className="px-5 gap-3">
            <Skeleton width="100%" height={120} borderRadius={24} />
            <Skeleton width="100%" height={120} borderRadius={24} />
          </View>
        ) : (
          <View className="px-5 gap-3">
            {featuredBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </View>
        )}
        </>
        )}

      </AnimatedScrollView>
    </View>
  );
}
