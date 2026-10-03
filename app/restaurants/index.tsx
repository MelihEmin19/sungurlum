import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import SpringButton from '@/components/ui/SpringButton';
import { Colors, Spacing, FontSizes, Fonts } from '@/constants/theme';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

const MOCK_RESTAURANTS = [
  {
    id: 'mock-rest-1',
    name: 'Lezzet Kebap & Pide',
    category: 'Kebap, Izgara',
    rating: 4.8,
    reviewCount: 124,
    deliveryTime: 30,
    minOrderAmount: 150,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
    status: 'approved',
    businessType: 'restaurant'
  },
  {
    id: 'mock-rest-2',
    name: 'Burger Station',
    category: 'Fast Food',
    rating: 4.5,
    reviewCount: 89,
    deliveryTime: 25,
    minOrderAmount: 120,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
    status: 'approved',
    businessType: 'restaurant'
  }
];

export default function RestaurantsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const q = query(collection(db, 'businesses'), where('businessType', '==', 'restaurant'), where('status', '==', 'approved'));
        const snap = await getDocs(q);
        if (snap.empty) {
          setRestaurants(MOCK_RESTAURANTS);
        } else {
          setRestaurants(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (e) {
        setRestaurants(MOCK_RESTAURANTS);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, paddingTop: insets.top }}>
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
        <SpringButton onPress={() => router.back()} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="arrowLeft" size={24} color={Colors.text} />
        </SpringButton>
        <Text style={{ fontSize: FontSizes.lg, ...Fonts.extraBold, color: Colors.text }}>Yemek Siparişi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          restaurants.map(rest => (
            <SpringButton 
              key={rest.id} 
              style={{ backgroundColor: Colors.surface, borderRadius: 16, overflow: 'hidden', marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.borderLight }}
              onPress={() => router.push(`/restaurants/${rest.id}`)}
            >
              <View style={{ width: '100%', height: 160, backgroundColor: Colors.border }}>
                {rest.image ? (
                  <Image source={{ uri: rest.image }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="utensils" size={40} color={Colors.textTertiary} />
                  </View>
                )}
                {/* Delivery Time Badge */}
                <View style={{ position: 'absolute', bottom: 12, right: 12, backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
                  <Text style={{ fontSize: FontSizes.xs, ...Fonts.bold, color: Colors.text }}>{rest.deliveryTime || 30} dk</Text>
                </View>
              </View>
              <View style={{ padding: Spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <Text style={{ fontSize: FontSizes.lg, ...Fonts.extraBold, color: Colors.text, flex: 1 }}>{rest.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.warning + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                    <Icon name="star" size={14} color={Colors.warning} />
                    <Text style={{ fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.warning, marginLeft: 4 }}>{rest.rating || 'Yeni'}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: 8 }}>{rest.category}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="truck" size={14} color={Colors.food} />
                  <Text style={{ fontSize: FontSizes.xs, ...Fonts.medium, color: Colors.textSecondary, marginLeft: 6 }}>
                    Min. Sipariş: ₺{rest.minOrderAmount || 100}
                  </Text>
                </View>
              </View>
            </SpringButton>
          ))
        )}
      </ScrollView>
    </View>
  );
}
