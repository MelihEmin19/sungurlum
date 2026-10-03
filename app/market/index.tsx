import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import SpringButton from '@/components/ui/SpringButton';
import { Colors } from '@/theme';
import { useCartStore, SelectedOption } from '@/stores/cartStore';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import AddToCartButton from '@/components/ui/AddToCartButton';
import { getProducts, ProductOption } from '@/services/products';
import ProductOptionsModal from '@/components/ui/ProductOptionsModal';
import Skeleton from '@/components/ui/Skeleton';

export interface MarketProduct {
  id?: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  inStock: boolean;
  options?: ProductOption[];
}

// Mock data for preview when DB is empty
const MOCK_PRODUCTS: MarketProduct[] = [
  { id: '1', name: 'Damacana Su 19L', price: 75, category: 'Su & İçecek', inStock: true, image: 'https://images.unsplash.com/photo-1616400619175-5da9a19c5b59?w=500&q=80' },
  { id: '2', name: 'Köy Ekmeği', price: 15, category: 'Fırın', inStock: true, image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500&q=80' },
  { id: '3', name: 'Günlük Süt 1L', price: 35, category: 'Süt Ürünleri', inStock: true, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80' },
  { id: '4', name: 'Domates (1 kg)', price: 40, category: 'Manav', inStock: true, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80' },
  { id: '5', name: 'Lipton Doğu Karadeniz Çay 1000g', price: 145, category: 'Temel Gıda', inStock: true, image: 'https://images.unsplash.com/photo-1571934811356-5cc50f160cb2?w=500&q=80' },
];

export default function MarketScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cart = useCartStore();
  
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tümü');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const dbProducts = await getProducts('market', 'admin');
        if (dbProducts.length === 0) {
          setProducts(MOCK_PRODUCTS);
        } else {
          const mappedProducts = dbProducts.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            inStock: p.isAvailable,
            image: p.imageUrl,
            options: p.options
          })) as MarketProduct[];
          setProducts([...mappedProducts, ...MOCK_PRODUCTS]);
        }
      } catch (error) {
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ['Tümü', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'Tümü' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const [selectedProductForOptions, setSelectedProductForOptions] = useState<any>(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);

  const handleAddToCart = (product: MarketProduct) => {
    if (product.options && product.options.length > 0) {
      setSelectedProductForOptions(product);
      setOptionsModalVisible(true);
      return;
    }
    
    if (!cart.canAddToCart('admin')) {
      import('react-native').then(({ Alert }) => {
        Alert.alert(
          'Farklı İşletme',
          'Sepetinizde farklı bir işletmeye ait ürünler var. Sepeti temizleyip bu ürünü eklemek ister misiniz?',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Evet, Temizle', style: 'destructive', onPress: () => cart.addToCart({ id: product.id!, name: product.name, price: product.price, basePrice: product.price, image: product.image }, 'admin') }
          ]
        );
      });
    } else {
      cart.addToCart({ id: product.id!, name: product.name, price: product.price, basePrice: product.price, image: product.image }, 'admin');
    }
  };

  const handleAddToCartWithOptions = (product: any, selectedOptions: SelectedOption[], totalPrice: number) => {
    if (!cart.canAddToCart('admin')) {
      import('react-native').then(({ Alert }) => {
        Alert.alert(
          'Farklı İşletme',
          'Sepetinizde farklı bir işletmeye ait ürünler var. Sepeti temizleyip bu ürünü eklemek ister misiniz?',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Evet, Temizle', style: 'destructive', onPress: () => cart.addToCart({ id: product.id!, name: product.name, price: totalPrice, basePrice: product.price, image: product.image, selectedOptions }, 'admin') }
          ]
        );
      });
    } else {
      cart.addToCart({ id: product.id!, name: product.name, price: totalPrice, basePrice: product.price, image: product.image, selectedOptions }, 'admin');
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="bg-surface border-b border-border/20 z-10">
        <View className="h-14 flex-row items-center px-4 justify-between">
          <SpringButton className="w-10 h-10 items-center justify-center rounded-full bg-background" onPress={() => router.back()}>
            <Icon name="arrowLeft" size={24} color="textPrimary" />
          </SpringButton>
          <Text className="text-lg font-extrabold text-textPrimary">Market & Sipariş</Text>
          <View className="w-10" />
        </View>
        
        {/* Search Bar */}
        <View className="px-4 pb-4 mt-2">
          <View className="flex-row items-center bg-background h-12 rounded-2xl px-4 border border-border/40">
            <Icon name="search" size={20} color="textTertiary" />
            <TextInput
              className="flex-1 h-full ml-3 text-base text-textPrimary font-medium"
              placeholder="Ne aramıştınız? (Örn: Ekmek, Su...)"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <SpringButton onPress={() => setSearchQuery('')} className="p-1">
                <Icon name="xCircle" size={20} color="textTertiary" />
              </SpringButton>
            )}
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Custom Request Banner */}
        <View className="p-4">
          <SpringButton 
            className="w-full bg-warning/10 rounded-2xl p-4 flex-row items-center border border-warning/20 shadow-sm shadow-warning/10"
            onPress={() => router.push('/market/custom-request')}
          >
            <View className="w-12 h-12 rounded-full bg-warning items-center justify-center mr-4">
              <Icon name="package" size={24} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-warning font-extrabold text-base mb-1">Benim İçin Al!</Text>
              <Text className="text-textSecondary text-xs font-medium">Kırtasiye, hırdavat veya özel istekleriniz için not bırakın, getirelim.</Text>
            </View>
            <Icon name="chevronRight" size={20} color="warning" />
          </SpringButton>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-4" contentContainerStyle={{ paddingRight: 32 }}>
          {categories.map(category => {
            const isActive = activeCategory === category;
            return (
              <SpringButton
                key={category}
                onPress={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-full mr-2 border ${isActive ? 'bg-market border-market' : 'bg-surface border-border/50'}`}
              >
                <Text className={`font-bold ${isActive ? 'text-white' : 'text-textSecondary'}`}>
                  {category}
                </Text>
              </SpringButton>
            );
          })}
        </ScrollView>

        {/* Product Grid */}
        {loading ? (
          <View className="px-4 flex-row flex-wrap justify-between mt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View key={i} className="bg-surface rounded-2xl p-3 mb-4 border border-border/30" style={{ width: '48%' }}>
                <Skeleton width="100%" height={112} borderRadius={12} style={{ marginBottom: 12 }} />
                <Skeleton width={64} height={12} borderRadius={6} style={{ marginBottom: 8 }} />
                <Skeleton width="100%" height={16} borderRadius={8} style={{ marginBottom: 4 }} />
                <Skeleton width="75%" height={16} borderRadius={8} style={{ marginBottom: 16 }} />
                <View className="flex-row items-center justify-between mt-auto">
                  <Skeleton width={64} height={24} borderRadius={6} />
                  <Skeleton width={36} height={36} borderRadius={8} />
                </View>
              </View>
            ))}
          </View>
        ) : filteredProducts.length === 0 ? (
          <View className="items-center justify-center mt-10">
            <Icon name="search" size={48} color="border" />
            <Text className="text-textSecondary font-medium mt-4">Aradığınız ürün bulunamadı.</Text>
          </View>
        ) : (
          <View className="px-4 flex-row flex-wrap justify-between mt-2 mb-20">
            {filteredProducts.map((product) => {
              const cartItemsOfProduct = cart.items.filter(i => i.id === product.id);
              const quantity = cartItemsOfProduct.reduce((sum, item) => sum + item.quantity, 0);
              
              const handleRemoveClick = () => {
                if (cartItemsOfProduct.length === 1) {
                  cart.updateQuantity(cartItemsOfProduct[0].cartItemId, cartItemsOfProduct[0].quantity - 1);
                } else {
                  import('react-native').then(({ Alert }) => Alert.alert('Varyantlı Ürün', 'Lütfen bu ürünü sepetinizden düzenleyin.'));
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
                <View key={product.id} className="bg-surface rounded-2xl p-3 mb-4 border border-border/30" style={{ width: '48%' }}>
                  <View className="w-full h-28 bg-background rounded-xl mb-3 overflow-hidden items-center justify-center">
                    {product.image ? (
                      <Image source={{ uri: product.image }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <Icon name="image" size={32} color="border" />
                    )}
                  </View>
                  <Text className="text-xs font-bold text-market mb-1">{product.category}</Text>
                  <Text className="text-sm font-bold text-textPrimary leading-5 mb-2" numberOfLines={2}>
                    {product.name}
                  </Text>
                  
                  <View className="flex-row items-center justify-between mt-auto">
                    <Text className="text-lg font-extrabold text-textPrimary">₺{product.price}</Text>
                    
                    {quantity > 0 ? (
                      <View className="flex-row items-center bg-market rounded-lg h-9">
                        <SpringButton className="w-8 items-center justify-center" onPress={handleRemoveClick}>
                          <Icon name="minus" size={16} color="#FFFFFF" />
                        </SpringButton>
                        <Text className="text-white font-bold w-6 text-center">{quantity}</Text>
                        <SpringButton className="w-8 items-center justify-center" onPress={handleAddClick}>
                          <Icon name="plus" size={16} color="#FFFFFF" />
                        </SpringButton>
                      </View>
                    ) : (
                      <AddToCartButton 
                        size={36} 
                        color="marketGreen"
                        onAdd={() => handleAddToCart(product)} 
                      />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Cart Bottom Sheet / Button */}
      {cart.getTotalItems() > 0 && (
        <View className="absolute bottom-0 left-0 right-0 p-5 bg-surface border-t border-border/20 shadow-lg" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
          <SpringButton 
            className="w-full bg-market h-14 rounded-2xl flex-row items-center justify-between px-5 shadow-lg shadow-market/30"
            onPress={() => router.push('/market/checkout')}
          >
            <View className="bg-white/20 px-3 py-1.5 rounded-lg flex-row items-center">
              <Icon name="shoppingBag" size={16} color="#FFFFFF" />
              <Text className="text-white font-bold ml-2">{cart.getTotalItems()} Ürün</Text>
            </View>
            <View className="flex-row items-center">
              <AnimatedNumber 
                value={Number(cart.getTotalPrice())} 
                prefix="₺" 
                style={{ color: '#FFFFFF', fontSize: 18, marginRight: 8 }} 
              />
              <Icon name="chevronRight" size={20} color="#FFFFFF" />
            </View>
          </SpringButton>
        </View>
      )}

      <ProductOptionsModal 
        visible={optionsModalVisible}
        product={selectedProductForOptions as any}
        onClose={() => setOptionsModalVisible(false)}
        onAddToCart={handleAddToCartWithOptions}
      />
    </View>
  );
}
