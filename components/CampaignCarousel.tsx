import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  useAnimatedScrollHandler,
  withSpring,
  SharedValue,
} from 'react-native-reanimated';
import { getCampaigns } from '@/services/campaigns';
import { Campaign } from '@/constants/mockData';
import SpringButton from '@/components/ui/SpringButton';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_MARGIN = 8;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN * 2;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

function CampaignCard({ 
  campaign, 
  index, 
  scrollX 
}: { 
  campaign: Campaign; 
  index: number; 
  scrollX: SharedValue<number>;
}) {
  const router = useRouter();
  
  const cardStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SNAP_INTERVAL,
      index * SNAP_INTERVAL,
      (index + 1) * SNAP_INTERVAL,
    ];
    
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.92, 1, 0.92],
      Extrapolation.CLAMP
    );
    
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6],
      Extrapolation.CLAMP
    );
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[{ width: CARD_WIDTH, marginHorizontal: CARD_MARGIN }, cardStyle]}>
      <SpringButton
        className="rounded-[20px] overflow-hidden shadow-lg"
        scaleTo={0.96}
        onPress={() => router.push(`/business/${campaign.businessId}` as any)}
      >
        <View className="h-[180px] p-5 justify-between relative bg-primary shadow-primary/30">
          
          {/* Decorative circles */}
          <View 
            className="absolute -right-6 -top-6 w-28 h-28 rounded-full" 
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} 
          />
          <View 
            className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full" 
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} 
          />
          
          {/* Top Row */}
          <View className="flex-row justify-between items-start z-10">
            <View className="bg-white/25 px-3 py-1.5 rounded-lg">
              <Text className="text-[10px] font-extrabold text-white tracking-[1.5px]">FIRSAT</Text>
            </View>
            <View className="flex-row items-center bg-black/15 px-2 py-1 rounded-md gap-1">
              <Icon name="store" size={14} color="#FFFFFF" />
              <Text className="text-xs font-bold text-white">{campaign.businessName}</Text>
            </View>
          </View>
          
          {/* Bottom Row */}
          <View className="z-10 mt-auto">
            <Text className="text-[22px] font-extrabold text-white tracking-tight leading-8 mb-1" numberOfLines={2}>
              {campaign.title}
            </Text>
            <Text className="text-sm font-medium text-white/90 leading-5" numberOfLines={2}>
              {campaign.description}
            </Text>
          </View>

        </View>
      </SpringButton>
    </Animated.View>
  );
}

export default function CampaignCarousel() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const scrollX = useSharedValue(0);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const data = await getCampaigns();
      setCampaigns(data.filter((c) => c.status === 'active'));
    };
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (campaigns.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % campaigns.length;
        scrollViewRef.current?.scrollTo({
          x: next * SNAP_INTERVAL,
          animated: true,
        });
        return next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [campaigns.length]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    scrollX.value = x;
    const index = Math.round(x / SNAP_INTERVAL);
    if (index !== activeIndex && index >= 0 && index < campaigns.length) {
      setActiveIndex(index);
    }
  };

  if (campaigns.length === 0) return null;

  return (
    <View className="mt-6">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 24 - CARD_MARGIN }}
      >
        {campaigns.map((campaign, index) => (
          <CampaignCard 
            key={campaign.id} 
            campaign={campaign} 
            index={index}
            scrollX={scrollX}
          />
        ))}
      </ScrollView>

      {/* Animated Dots */}
      <View className="flex-row justify-center items-center mt-4 gap-2">
        {campaigns.map((_, index) => {
          const isActive = index === activeIndex;
          return (
            <View
              key={index}
              className="rounded-full"
              style={{
                width: isActive ? 24 : 6,
                height: 6,
                backgroundColor: isActive ? '#0097A7' : '#E5E7EB',
              }}
            />
          );
        })}
      </View>
    </View>
  );
}
