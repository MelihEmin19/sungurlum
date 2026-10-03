import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import SpringButton from '@/components/ui/SpringButton';
import { Colors } from '@/constants/theme';
import { getBusinessOrders, updateOrderStatus, Order } from '@/services/orders';
import { useAuthStore } from '@/stores/authStore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function BusinessOrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBiz = async () => {
      if (!user) return;
      let bizId = null;
      try {
        const q = query(collection(db, 'businesses'), where('ownerId', '==', user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          bizId = snap.docs[0].id;
        } else if (user.email === 'admin@sungurlum.com' || user.uid === 'admin123') {
          bizId = 'mock-biz';
        }
        
        if (bizId) {
          setBusinessId(bizId);
          fetchOrders(bizId);
        } else {
          Alert.alert('Hata', 'İşletme kaydı bulunamadı.');
          setLoading(false);
        }
      } catch(e) {
        setLoading(false);
      }
    };
    fetchBiz();
  }, [user]);

  const fetchOrders = async (bizId: string) => {
    try {
      const data = await getBusinessOrders(bizId);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching biz orders:', error);
      Alert.alert('Hata', 'Siparişler yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    if (!businessId) return;
    setRefreshing(true);
    fetchOrders(businessId);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
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
          <View className="items-center justify-center mt-20 opacity-60">
            <Icon name="inbox" size={64} color="muted" />
            <Text className="text-base font-bold text-textSecondary mt-4 text-center px-4">
              Bekleyen siparişiniz bulunmuyor.
            </Text>
          </View>
        ) : (
          orders.map((order) => {
            const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('tr-TR') : 'Tarih Yok';

            return (
              <View key={order.id} className="bg-surface p-5 rounded-2xl mb-4 border border-border/40 shadow-sm shadow-black/5">
                <View className="flex-row justify-between items-start mb-3 border-b border-border/30 pb-3">
                  <View className="flex-1 pr-2">
                    <View className="flex-row items-center mb-1">
                      <Icon name="utensils" size={16} color="primary" />
                      <Text className="text-sm font-extrabold text-textPrimary ml-2 uppercase">YEMEK SİPARİŞİ</Text>
                    </View>
                    <Text className="text-xs font-bold text-textTertiary">{date}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-bold text-textSecondary">Durum:</Text>
                    <Text className={`text-sm font-extrabold text-${order.status === 'delivered' ? 'success' : order.status === 'pending' ? 'warning' : 'primary'}`}>
                      {order.status === 'pending' ? 'YENİ SİPARİŞ' : order.status.toUpperCase()}
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
                <View className="mb-4 bg-background p-3 rounded-xl">
                  {order.items?.map((item, idx) => (
                    <View key={item.id} className="flex-row justify-between items-center mb-2">
                      <Text className="text-sm font-medium text-textSecondary flex-1">
                        <Text className="font-bold text-textPrimary">{item.quantity}x</Text> {item.name}
                      </Text>
                      <Text className="text-sm font-bold text-textPrimary">₺{item.price * item.quantity}</Text>
                    </View>
                  ))}
                  {order.customNote && (
                    <View className="mt-2 pt-2 border-t border-border/30">
                      <Text className="text-xs font-bold text-warning-800">Müşteri Notu:</Text>
                      <Text className="text-sm font-medium text-textSecondary">{order.customNote}</Text>
                    </View>
                  )}
                </View>

                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-sm font-bold text-textSecondary">
                    Ödeme: {order.paymentMethod === 'cash' ? 'Kapıda Ödeme' : 'Online'}
                  </Text>
                  <Text className="text-xl font-extrabold text-primary">₺{order.totalAmount}</Text>
                </View>

                {/* Action Buttons */}
                <View className="flex-row flex-wrap gap-2 pt-3 border-t border-border/30">
                  {order.status === 'pending' && (
                    <>
                      <SpringButton className="flex-1 bg-info h-12 rounded-xl items-center justify-center" onPress={() => handleUpdateStatus(order.id!, 'preparing')}>
                        <Text className="text-white font-bold text-sm">Onayla ve Hazırla</Text>
                      </SpringButton>
                    </>
                  )}
                  {order.status === 'preparing' && (
                    <SpringButton className="flex-1 bg-primary h-12 rounded-xl items-center justify-center" onPress={() => handleUpdateStatus(order.id!, 'on_way')}>
                      <Text className="text-white font-bold text-sm">Kuryeye Ver (Yolda)</Text>
                    </SpringButton>
                  )}
                  {order.status === 'on_way' && (
                    <SpringButton className="flex-1 bg-success h-12 rounded-xl items-center justify-center" onPress={() => handleUpdateStatus(order.id!, 'delivered')}>
                      <Text className="text-white font-bold text-sm">Teslim Edildi</Text>
                    </SpringButton>
                  )}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <SpringButton className="px-4 bg-danger/10 h-12 rounded-xl items-center justify-center" onPress={() => {
                      Alert.alert('Siparişi İptal Et', 'Bu siparişi iptal etmek istediğinize emin misiniz?', [
                        { text: 'Vazgeç', style: 'cancel' },
                        { text: 'İptal Et', style: 'destructive', onPress: () => handleUpdateStatus(order.id!, 'cancelled') }
                      ])
                    }}>
                      <Text className="text-danger font-bold text-sm">İptal</Text>
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
