import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import SpringButton from '@/components/ui/SpringButton';
import { Colors } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { getUserOrders, Order } from '@/services/orders';
import { useCartStore } from '@/stores/cartStore';

export default function MyOrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const cart = useCartStore();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const dbOrders = await getUserOrders(user.uid);
      setOrders(dbOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Hata', 'Siparişleriniz yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'preparing': return 'info';
      case 'on_way': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'textSecondary';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Onay Bekliyor';
      case 'preparing': return 'Hazırlanıyor';
      case 'on_way': return 'Kurye Yolda';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal Edildi';
      default: return 'Bilinmiyor';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'clock';
      case 'preparing': return 'package';
      case 'on_way': return 'truck';
      case 'delivered': return 'checkCircle';
      case 'cancelled': return 'xCircle';
      default: return 'helpCircle';
    }
  };

  const handleReorder = (order: Order) => {
    if (!order.items || order.items.length === 0) return;
    const itemsToCart = order.items.map(item => ({
      ...item,
      cartItemId: Math.random().toString(),
      basePrice: item.price
    }));
    cart.setItems(itemsToCart as any);
    router.push('/market/checkout' as any);
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }} className="bg-surface border-b border-border/20 z-10">
        <View className="h-14 flex-row items-center px-4 justify-between">
          <SpringButton className="w-10 h-10 items-center justify-center rounded-full bg-background" onPress={() => router.back()}>
            <Icon name="arrowLeft" size={24} color="textPrimary" />
          </SpringButton>
          <Text className="text-lg font-extrabold text-textPrimary">Siparişlerim</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : orders.length === 0 ? (
          <View className="items-center justify-center mt-20">
            <View className="w-24 h-24 rounded-full bg-surface items-center justify-center mb-6 shadow-sm shadow-black/5 border border-border/40">
              <Icon name="shoppingBag" size={48} color="border" />
            </View>
            <Text className="text-xl font-extrabold text-textPrimary text-center px-4 mb-2">
              Henüz Siparişiniz Yok
            </Text>
            <Text className="text-sm font-medium text-textSecondary text-center px-8 mb-8 leading-5">
              Market veya özel siparişleriniz burada listelenir. Hadi hemen sipariş verin!
            </Text>
            <SpringButton 
              className="bg-primary px-8 py-3.5 rounded-2xl shadow-lg shadow-primary/30"
              onPress={() => router.push('/market' as any)}
            >
              <Text className="text-white font-extrabold text-base">Markete Git</Text>
            </SpringButton>
          </View>
        ) : (
          orders.map((order) => {
            const statusColor = getStatusColor(order.status);
            const statusText = getStatusText(order.status);
            const statusIcon = getStatusIcon(order.status);
            const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('tr-TR') : 'Tarih Yok';
            const time = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '';
            const isCustom = order.type === 'custom';

            return (
              <SpringButton 
                key={order.id} 
                className="bg-surface p-5 rounded-2xl mb-4 border border-border/40 shadow-sm shadow-black/5"
                onPress={() => router.push(`/my-orders/${order.id}`)}
              >
                <View className="flex-row justify-between items-start mb-4 border-b border-border/30 pb-3">
                  <View>
                    <Text className="text-xs font-bold text-textTertiary mb-1">{date} - {time}</Text>
                    <View className="flex-row items-center">
                      <Icon name={isCustom ? "package" : order.type === 'restaurant' ? "utensils" : "shoppingBag"} size={16} color="textPrimary" />
                      <Text className="text-base font-extrabold text-textPrimary ml-2">
                        {isCustom ? 'Özel İstek (Getir-Götür)' : order.type === 'restaurant' ? 'Yemek Siparişi' : 'Market Siparişi'}
                      </Text>
                    </View>
                  </View>
                  <View className={`bg-${statusColor}/10 px-3 py-1.5 rounded-full flex-row items-center`}>
                    <Icon name={statusIcon} size={14} color={statusColor} />
                    <Text className={`text-${statusColor} font-bold text-xs ml-1.5`}>{statusText}</Text>
                  </View>
                </View>

                {isCustom ? (
                  <View className="bg-background p-3 rounded-xl mb-4">
                    <Text className="text-sm font-medium text-textSecondary leading-5">"{order.customNote}"</Text>
                  </View>
                ) : (
                  <View className="mb-4">
                    {order.items?.map((item, idx) => (
                      <View key={item.id} className={`flex-row justify-between items-center ${idx !== order.items!.length - 1 ? 'mb-2' : ''}`}>
                        <Text className="text-sm font-medium text-textSecondary flex-1" numberOfLines={1}>
                          <Text className="font-bold text-textPrimary">{item.quantity}x</Text> {item.name}
                        </Text>
                        <Text className="text-sm font-bold text-textPrimary">₺{item.price * item.quantity}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View className="flex-row justify-between items-center pt-3 border-t border-border/30">
                  <Text className="text-sm font-bold text-textSecondary">
                    Ödeme: {order.paymentMethod === 'cash' ? 'Kapıda Nakit/POS' : 'Online Kredi Kartı'}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-sm font-medium text-textSecondary mr-2">Toplam:</Text>
                    <Text className="text-lg font-extrabold text-primary">
                      {isCustom && order.status === 'pending' ? 'Belli Değil' : `₺${order.totalAmount}`}
                    </Text>
                  </View>
                </View>

                {/* Tekrar Sipariş Ver Butonu */}
                {!isCustom && order.status === 'delivered' && (
                  <SpringButton 
                    className="w-full bg-primary/10 py-3 rounded-xl mt-4 items-center justify-center flex-row"
                    onPress={() => handleReorder(order)}
                  >
                    <Icon name="refreshCcw" size={16} color="primary" />
                    <Text className="text-primary font-bold ml-2">Aynısını Sepete Ekle</Text>
                  </SpringButton>
                )}
              </SpringButton>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
