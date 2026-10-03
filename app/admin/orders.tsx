import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import SpringButton from '@/components/ui/SpringButton';
import Skeleton from '@/components/ui/Skeleton';
import { Colors } from '@/theme';
import { getAllOrders, updateOrderStatus, Order } from '@/services/orders';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { sendPushNotification } from '@/services/notifications';

export default function AdminOrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      Alert.alert('Hata', 'Siparişler yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status'], userId: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

      // Push Notification Logic
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const pushToken = userDoc.data().pushToken;
          if (pushToken) {
            let title = '';
            let body = '';
            if (newStatus === 'on_way') {
              title = 'Siparişiniz Yola Çıktı! 🚀';
              body = 'Kuryemiz siparişinizi teslim etmek üzere yola çıkmıştır.';
            } else if (newStatus === 'delivered') {
              title = 'Siparişiniz Teslim Edildi ✅';
              body = 'Afiyet olsun! Bizi tercih ettiğiniz için teşekkürler.';
            } else if (newStatus === 'cancelled') {
              title = 'Siparişiniz İptal Edildi ❌';
              body = 'Siparişiniz maalesef iptal edilmiştir.';
            }
            if (title) {
              await sendPushNotification(pushToken, title, body, { orderId });
            }
          }
        }
      } catch (e) {
        console.error('Bildirim gönderilirken hata:', e);
      }
      
    } catch (error) {
      Alert.alert('Hata', 'Durum güncellenemedi.');
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }} className="bg-surface border-b border-border/20 z-10">
        <View className="h-14 flex-row items-center px-4 justify-between">
          <SpringButton className="w-10 h-10 items-center justify-center rounded-full bg-background" onPress={() => router.back()}>
            <Icon name="arrowLeft" size={24} color="textPrimary" />
          </SpringButton>
          <Text className="text-lg font-extrabold text-textPrimary">Kurye Paneli</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {loading ? (
          <View>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className="bg-surface p-5 rounded-2xl mb-4 border border-border/40 shadow-sm shadow-black/5">
                <View className="flex-row justify-between mb-3 border-b border-border/30 pb-3">
                  <Skeleton width={120} height={16} borderRadius={4} />
                  <Skeleton width={80} height={16} borderRadius={4} />
                </View>
                <Skeleton width="100%" height={60} borderRadius={8} style={{ marginBottom: 12 }} />
                <Skeleton width="80%" height={16} borderRadius={4} style={{ marginBottom: 12 }} />
                <View className="flex-row justify-between">
                  <Skeleton width={100} height={20} borderRadius={4} />
                  <Skeleton width={80} height={24} borderRadius={4} />
                </View>
              </View>
            ))}
          </View>
        ) : orders.length === 0 ? (
          <View className="items-center justify-center mt-20 opacity-60">
            <Icon name="inbox" size={64} color="muted" />
            <Text className="text-base font-bold text-textSecondary mt-4 text-center px-4">
              Hiç sipariş bulunmuyor.
            </Text>
          </View>
        ) : (
          orders.map((order) => {
            const isCustom = order.type === 'custom';
            const isRestaurant = order.type === 'restaurant';
            const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('tr-TR') : 'Tarih Yok';

            return (
              <View key={order.id} className="bg-surface p-5 rounded-2xl mb-4 border border-border/40 shadow-sm shadow-black/5">
                <View className="flex-row justify-between items-start mb-3 border-b border-border/30 pb-3">
                  <View className="flex-1 pr-2">
                    <View className="flex-row items-center mb-1">
                      <Icon name={isCustom ? "package" : isRestaurant ? "utensils" : "shoppingBag"} size={16} color={isCustom ? "warning" : isRestaurant ? "danger" : "primary"} />
                      <Text className="text-sm font-extrabold text-textPrimary ml-2 uppercase">
                        {isCustom ? 'ÖZEL İSTEK' : isRestaurant ? 'RESTORAN SİPARİŞİ' : 'MARKET'}
                      </Text>
                    </View>
                    <Text className="text-xs font-bold text-textTertiary">{date}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-bold text-textSecondary">Durum:</Text>
                    <Text className={`text-sm font-extrabold text-${order.status === 'delivered' ? 'success' : order.status === 'pending' ? 'warning' : 'primary'}`}>
                      {order.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Customer Details */}
                <View className="bg-background p-3 rounded-xl mb-3">
                  <Text className="text-sm font-bold text-textPrimary mb-1">{order.userName}</Text>
                  <Text className="text-sm font-medium text-textSecondary mb-1">{order.phone}</Text>
                  <Text className="text-sm font-medium text-textSecondary">{order.address}</Text>
                </View>

                {/* Order Contents */}
                {isCustom ? (
                  <View className="bg-warning/10 p-3 rounded-xl mb-4 border border-warning/20">
                    <Text className="text-sm font-medium text-warning-800 leading-5">"{order.customNote}"</Text>
                  </View>
                ) : (
                  <View className="mb-4">
                    {order.items?.map((item, idx) => (
                      <View key={item.id} className="flex-row justify-between items-center mb-1">
                        <Text className="text-sm font-medium text-textSecondary">
                          <Text className="font-bold text-textPrimary">{item.quantity}x</Text> {item.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-sm font-bold text-textSecondary">
                    Ödeme: {order.paymentMethod === 'cash' ? 'Kapıda' : 'Online'}
                  </Text>
                  <Text className="text-lg font-extrabold text-primary">₺{order.totalAmount}</Text>
                </View>

                {/* Action Buttons */}
                <View className="flex-row flex-wrap gap-2 pt-3 border-t border-border/30">
                  {order.status === 'pending' && (
                    <>
                      <SpringButton className="flex-1 bg-info h-10 rounded-xl items-center justify-center" onPress={() => handleUpdateStatus(order.id!, 'preparing', order.userId)}>
                        <Text className="text-white font-bold text-xs">Hazırlanıyor</Text>
                      </SpringButton>
                      <SpringButton className="flex-1 bg-primary h-10 rounded-xl items-center justify-center" onPress={() => handleUpdateStatus(order.id!, 'on_way', order.userId)}>
                        <Text className="text-white font-bold text-xs">Yola Çıkar</Text>
                      </SpringButton>
                    </>
                  )}
                  {['preparing', 'on_way'].includes(order.status) && (
                    <SpringButton className="flex-1 bg-success h-10 rounded-xl items-center justify-center" onPress={() => handleUpdateStatus(order.id!, 'delivered', order.userId)}>
                      <Text className="text-white font-bold text-xs">Teslim Edildi</Text>
                    </SpringButton>
                  )}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <SpringButton className="px-4 bg-danger/10 h-10 rounded-xl items-center justify-center" onPress={() => handleUpdateStatus(order.id!, 'cancelled', order.userId)}>
                      <Text className="text-danger font-bold text-xs">İptal</Text>
                    </SpringButton>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
