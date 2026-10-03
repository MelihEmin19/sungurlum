import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import SpringButton from '@/components/ui/SpringButton';
import { Colors, Spacing, FontSizes, Fonts } from '@/constants/theme';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getProducts, Product } from '@/services/products';
import { useCartStore, SelectedOption } from '@/stores/cartStore';
import ProductOptionsModal from '@/components/ui/ProductOptionsModal';

// MOCK DATA FOR FALLBACK
const MOCK_RESTAURANTS: Record<string, any> = {
  'mock-rest-1': {
    id: 'mock-rest-1',
    name: 'Lezzet Kebap & Pide',
    category: 'Kebap, Izgara',
    rating: 4.8,
    reviewCount: 124,
    deliveryTime: 30,
    minOrderAmount: 150,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
  },
  'mock-rest-2': {
    id: 'mock-rest-2',
    name: 'Burger Station',
    category: 'Fast Food',
    rating: 4.5,
    reviewCount: 89,
    deliveryTime: 25,
    minOrderAmount: 120,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
  }
};

const MOCK_MENU: Record<string, Product[]> = {
  'mock-rest-1': [
    { id: 'm1', name: 'Adana Kebap', category: 'Kebaplar', price: 250, description: 'Acılı zırh kıyması, közlenmiş biber ve domates ile.', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1643265551381-8078dbb4b604?w=500&q=80', type: 'restaurant', businessId: 'mock-rest-1' },
    { id: 'm2', name: 'Urfa Kebap', category: 'Kebaplar', price: 250, description: 'Acısız zırh kıyması, közlenmiş biber ve domates ile.', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1643265551381-8078dbb4b604?w=500&q=80', type: 'restaurant', businessId: 'mock-rest-1' },
    { id: 'm3', name: 'Kuşbaşılı Kaşarlı Pide', category: 'Pideler', price: 220, description: 'Bol malzemeli, çıtır çıtır odun ateşinde.', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&q=80', type: 'restaurant', businessId: 'mock-rest-1' },
    { id: 'm4', name: 'Künefe', category: 'Tatlılar', price: 120, description: 'Hatay usulü, bol peynirli.', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1599307775537-8854cdfb42d6?w=500&q=80', type: 'restaurant', businessId: 'mock-rest-1' },
    { id: 'm5', name: 'Kutu Kola', category: 'İçecekler', price: 40, description: 'Soğuk 330ml', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80', type: 'restaurant', businessId: 'mock-rest-1' },
    { id: 'm6', name: 'Ayran', category: 'İçecekler', price: 25, description: 'Yayık ayranı, 300ml', isAvailable: true, type: 'restaurant', businessId: 'mock-rest-1' },
  ],
  'mock-rest-2': [
    { id: 'b1', name: 'Klasik Burger', category: 'Burgerler', price: 180, description: '150gr dana eti, cheddar, karamelize soğan.', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80', type: 'restaurant', businessId: 'mock-rest-2' },
    { id: 'b2', name: 'Çıtır Tavuk Burger', category: 'Burgerler', price: 160, description: 'Özel soslu çıtır tavuk.', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1615719413546-198b25453f85?w=500&q=80', type: 'restaurant', businessId: 'mock-rest-2' },
    { id: 'b3', name: 'Büyük Boy Patates', category: 'Yan Ürünler', price: 60, description: 'Baharatlı.', isAvailable: true, type: 'restaurant', businessId: 'mock-rest-2' },
  ]
};

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cart = useCartStore();

  const [restaurant, setRestaurant] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');
  
  const [selectedProductForOptions, setSelectedProductForOptions] = useState<Product | null>(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        let restData = null;
        if (typeof id === 'string') {
          const docRef = doc(db, 'businesses', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            restData = { id: docSnap.id, ...docSnap.data() };
          }
        }
        
        if (!restData) {
          restData = MOCK_RESTAURANTS[id as string] || MOCK_RESTAURANTS['mock-rest-1'];
        }
        setRestaurant(restData);

        const dbProducts = await getProducts('restaurant', restData.id);
        if (dbProducts.length > 0) {
          setProducts(dbProducts.filter(p => p.isAvailable));
        } else {
          setProducts(MOCK_MENU[restData.id] || MOCK_MENU['mock-rest-1']);
        }
      } catch (e) {
        setRestaurant(MOCK_RESTAURANTS[id as string] || MOCK_RESTAURANTS['mock-rest-1']);
        setProducts(MOCK_MENU[id as string] || MOCK_MENU['mock-rest-1']);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurantAndMenu();
  }, [id]);

  useEffect(() => {
    if (products.length > 0 && !activeCategory) {
      setActiveCategory(products[0].category);
    }
  }, [products]);

  const categories = Array.from(new Set(products.map(p => p.category)));
  const isClosed = restaurant?.isOpen === false;

  const handleAddToCart = (product: Product) => {
    if (isClosed) {
      Alert.alert('Kapalı', 'Bu işletme şu an sipariş kabul etmemektedir.');
      return;
    }
    
    if (product.options && product.options.length > 0) {
       setSelectedProductForOptions(product);
       setOptionsModalVisible(true);
       return;
    }

    if (!cart.canAddToCart(restaurant.id)) {
      Alert.alert(
        'Farklı İşletme',
        'Sepetinizde farklı bir işletmeye ait ürünler var. Sepeti temizleyip bu restorandan ürün eklemek ister misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Evet, Temizle', style: 'destructive', onPress: () => {
            cart.addToCart({ id: product.id!, name: product.name, price: product.price, basePrice: product.price, image: product.imageUrl }, restaurant.id);
          }}
        ]
      );
    } else {
      cart.addToCart({ id: product.id!, name: product.name, price: product.price, basePrice: product.price, image: product.imageUrl }, restaurant.id);
    }
  };

  const handleAddToCartWithOptions = (product: Product, selectedOptions: SelectedOption[], totalPrice: number) => {
    if (!cart.canAddToCart(restaurant.id)) {
      Alert.alert(
        'Farklı İşletme',
        'Sepetinizde farklı bir işletmeye ait ürünler var. Sepeti temizleyip bu restorandan ürün eklemek ister misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Evet, Temizle', style: 'destructive', onPress: () => {
            cart.addToCart({ id: product.id!, name: product.name, price: totalPrice, basePrice: product.price, image: product.imageUrl, selectedOptions }, restaurant.id);
          }}
        ]
      );
    } else {
      cart.addToCart({ id: product.id!, name: product.name, price: totalPrice, basePrice: product.price, image: product.imageUrl, selectedOptions }, restaurant.id);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header Image & Info */}
      <View style={{ height: 250, position: 'relative' }}>
        {restaurant.image ? (
          <Image source={{ uri: restaurant.image }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <View style={{ width: '100%', height: '100%', backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="store" size={48} color={Colors.textTertiary} />
          </View>
        )}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />
        
        <SpringButton 
          style={{ position: 'absolute', top: insets.top + 10, left: Spacing.lg, width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
          onPress={() => router.back()}
        >
          <Icon name="arrowLeft" size={24} color="#FFF" />
        </SpringButton>

        <View style={{ position: 'absolute', bottom: Spacing.lg, left: Spacing.lg, right: Spacing.lg }}>
          <Text style={{ fontSize: FontSizes.xxl, ...Fonts.extraBold, color: '#FFF', marginBottom: 4 }}>{restaurant.name}</Text>
          <Text style={{ fontSize: FontSizes.sm, ...Fonts.medium, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>{restaurant.category}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.warning, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
              <Icon name="star" size={14} color="#FFF" />
              <Text style={{ fontSize: FontSizes.sm, ...Fonts.bold, color: '#FFF', marginLeft: 4 }}>{restaurant.rating}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
              <Icon name="clock" size={14} color="#FFF" />
              <Text style={{ fontSize: FontSizes.sm, ...Fonts.bold, color: '#FFF', marginLeft: 4 }}>{restaurant.deliveryTime || 30} dk</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ fontSize: FontSizes.sm, ...Fonts.bold, color: '#FFF' }}>Min: ₺{restaurant.minOrderAmount || 100}</Text>
            </View>
            {isClosed && (
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.error, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ fontSize: FontSizes.sm, ...Fonts.bold, color: '#FFF' }}>ŞU AN KAPALI</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Categories */}
      <View style={{ backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md }}>
          {categories.map(cat => (
            <SpringButton 
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: activeCategory === cat ? Colors.primary : Colors.background, borderWidth: activeCategory === cat ? 0 : 1, borderColor: Colors.borderLight }}
            >
              <Text style={{ ...Fonts.bold, color: activeCategory === cat ? '#FFF' : Colors.textSecondary }}>{cat}</Text>
            </SpringButton>
          ))}
        </ScrollView>
      </View>

      {/* Menu List */}
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}>
        {products.filter(p => p.category === activeCategory).map(product => {
          const cartItemsOfProduct = cart.items.filter(i => i.id === product.id);
          const quantity = cartItemsOfProduct.reduce((sum, item) => sum + item.quantity, 0);

          const handleRemoveClick = () => {
            if (cartItemsOfProduct.length === 1) {
              cart.updateQuantity(cartItemsOfProduct[0].cartItemId, cartItemsOfProduct[0].quantity - 1);
            } else {
              Alert.alert('Varyantlı Ürün', 'Lütfen bu ürünü sepetinizden düzenleyin.');
            }
          };

          const handleAddClick = () => {
            if (product.options && product.options.length > 0) {
              setSelectedProductForOptions(product);
              setOptionsModalVisible(true);
            } else {
              if (cartItemsOfProduct.length > 0) {
                cart.updateQuantity(cartItemsOfProduct[0].cartItemId, cartItemsOfProduct[0].quantity + 1);
              } else {
                handleAddToCart(product);
              }
            }
          };

          return (
            <View key={product.id} style={{ backgroundColor: Colors.surface, borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.md, flexDirection: 'row', borderWidth: 1, borderColor: Colors.borderLight, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
              <View style={{ flex: 1, paddingRight: Spacing.md }}>
                <Text style={{ fontSize: FontSizes.md, ...Fonts.extraBold, color: Colors.text, marginBottom: 4 }}>{product.name}</Text>
                {product.description ? (
                  <Text style={{ fontSize: FontSizes.xs, ...Fonts.medium, color: Colors.textSecondary, marginBottom: 8 }} numberOfLines={2}>{product.description}</Text>
                ) : null}
                <Text style={{ fontSize: FontSizes.lg, ...Fonts.bold, color: Colors.primary, marginTop: 'auto' }}>₺{product.price}</Text>
              </View>
              
              <View style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
                {product.imageUrl ? (
                  <Image source={{ uri: product.imageUrl }} style={{ width: 80, height: 80, borderRadius: 12, backgroundColor: Colors.borderLight }} />
                ) : (
                  <View style={{ width: 80, height: 80, borderRadius: 12, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="utensils" size={32} color={Colors.textTertiary} />
                  </View>
                )}
                
                <View style={{ marginTop: -15, alignSelf: 'center' }}>
                  {isClosed ? (
                    <View style={{ backgroundColor: Colors.borderLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: Colors.border }}>
                      <Text style={{ fontSize: 10, ...Fonts.bold, color: Colors.textSecondary }}>KAPALI</Text>
                    </View>
                  ) : quantity > 0 ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, borderRadius: 20, paddingHorizontal: 4, height: 32, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 }}>
                      <SpringButton style={{ width: 28, alignItems: 'center', justifyContent: 'center' }} onPress={handleRemoveClick}>
                        <Icon name="minus" size={16} color="#FFF" />
                      </SpringButton>
                      <Text style={{ color: '#FFF', ...Fonts.bold, paddingHorizontal: 4 }}>{quantity}</Text>
                      <SpringButton style={{ width: 28, alignItems: 'center', justifyContent: 'center' }} onPress={handleAddClick}>
                        <Icon name="plus" size={16} color="#FFF" />
                      </SpringButton>
                    </View>
                  ) : (
                    <SpringButton 
                      style={{ backgroundColor: Colors.surface, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 }}
                      onPress={() => handleAddToCart(product)}
                    >
                      <Icon name="plus" size={20} color={Colors.primary} />
                    </SpringButton>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Cart Bottom Sheet */}
      {cart.getTotalItems() > 0 && (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.lg, paddingBottom: Math.max(insets.bottom, 20), backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.borderLight, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 }}>
          <SpringButton 
            style={{ width: '100%', height: 56, backgroundColor: Colors.primary, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}
            onPress={() => router.push('/market/checkout')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
              <Icon name="shoppingBag" size={16} color="#FFF" />
              <Text style={{ ...Fonts.bold, color: '#FFF', marginLeft: 8 }}>{cart.getTotalItems()} Ürün</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AnimatedNumber value={Number(cart.getTotalPrice())} prefix="₺" style={{ ...Fonts.extraBold, color: '#FFF', fontSize: FontSizes.lg, marginRight: 8 }} />
              <Icon name="chevronRight" size={20} color="#FFF" />
            </View>
          </SpringButton>
        </View>
      )}

      <ProductOptionsModal 
        visible={optionsModalVisible}
        product={selectedProductForOptions}
        onClose={() => setOptionsModalVisible(false)}
        onAddToCart={handleAddToCartWithOptions}
      />
    </View>
  );
}
