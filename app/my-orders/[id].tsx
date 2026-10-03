import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import SpringButton from '@/components/ui/SpringButton';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius } from '@/constants/theme';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Order } from '@/services/orders';
import Animated, { useAnimatedStyle, withTiming, withSpring, useSharedValue } from 'react-native-reanimated';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Animation values
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    if (typeof id !== 'string') return;
    
    // Live listener for order updates
    const docRef = doc(db, 'orders', id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as Order;
        setOrder(data);
        
        // Update animation based on status
        let targetProgress = 0;
        if (data.status === 'pending') targetProgress = 15;
        if (data.status === 'preparing') targetProgress = 50;
        if (data.status === 'on_way') targetProgress = 85;
        if (data.status === 'delivered') targetProgress = 100;
        
        progressWidth.value = withTiming(targetProgress, { duration: 800 });
      } else {
        Alert.alert('Hata', 'Sipariş bulunamadı.');
        router.back();
      }
      setLoading(false);
    }, (error) => {
      console.error('Error listening to order:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value * 0.8}%`
    };
  });

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!order) return null;

  const steps = [
    { id: 'pending', label: 'Onay Bekliyor', icon: 'clock' },
    { id: 'preparing', label: 'Hazırlanıyor', icon: 'package' },
    { id: 'on_way', label: 'Yola Çıktı', icon: 'truck' },
    { id: 'delivered', label: 'Teslim Edildi', icon: 'checkCircle' },
  ];

  const getStepStatus = (stepId: string) => {
    const statusOrder = ['pending', 'preparing', 'on_way', 'delivered'];
    const currentIdx = statusOrder.indexOf(order.status);
    const stepIdx = statusOrder.indexOf(stepId);
    
    if (order.status === 'cancelled') return 'cancelled';
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'pending';
  };

  const isCustom = order.type === 'custom';
  const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('tr-TR') : '';
  const time = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ paddingTop: insets.top, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, zIndex: 10 }}>
        <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, justifyContent: 'space-between' }}>
          <SpringButton style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Colors.background }} onPress={() => router.back()}>
            <Icon name="arrowLeft" size={24} color={Colors.text} />
          </SpringButton>
          <Text style={{ fontSize: FontSizes.lg, ...Fonts.extraBold, color: Colors.text }}>Sipariş Detayı</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}>
        
        {/* Animated Timeline */}
        <View style={{ backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.xl, marginBottom: Spacing.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: Colors.borderLight }}>
          <Text style={{ fontSize: FontSizes.md, ...Fonts.extraBold, color: Colors.text, marginBottom: Spacing.xl, textAlign: 'center' }}>Sipariş Durumu</Text>
          
          {order.status === 'cancelled' ? (
            <View style={{ alignItems: 'center', paddingVertical: Spacing.xl }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.errorLight, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md }}>
                <Icon name="xCircle" size={32} color={Colors.error} />
              </View>
              <Text style={{ fontSize: FontSizes.lg, ...Fonts.extraBold, color: Colors.error }}>Sipariş İptal Edildi</Text>
              <Text style={{ fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 4 }}>Bu sipariş iptal edilmiştir.</Text>
            </View>
          ) : (
            <View style={{ position: 'relative' }}>
              {/* Progress Background */}
              <View style={{ position: 'absolute', top: 16, left: '10%', right: '10%', height: 4, backgroundColor: Colors.borderLight, borderRadius: 2 }} />
              {/* Animated Progress Fill */}
              <Animated.View style={[{ position: 'absolute', top: 16, left: '10%', height: 4, backgroundColor: Colors.primary, borderRadius: 2 }, animatedProgressStyle]} />
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {steps.map((step, idx) => {
                  const status = getStepStatus(step.id);
                  const isCurrent = status === 'current';
                  const isCompleted = status === 'completed';
                  
                  return (
                    <View key={step.id} style={{ alignItems: 'center', width: '25%' }}>
                      <View style={{ 
                        width: 36, height: 36, borderRadius: 18, 
                        backgroundColor: isCompleted ? Colors.primary : isCurrent ? Colors.primaryLight : Colors.background,
                        borderWidth: isCurrent ? 2 : 0, borderColor: Colors.primary,
                        alignItems: 'center', justifyContent: 'center',
                        marginBottom: Spacing.sm,
                        zIndex: 2
                      }}>
                        <Icon name={step.icon} size={18} color={isCompleted ? '#FFF' : isCurrent ? Colors.primary : Colors.textTertiary} />
                      </View>
                      <Text style={{ fontSize: 10, ...Fonts.bold, color: isCurrent ? Colors.primary : isCompleted ? Colors.text : Colors.textTertiary, textAlign: 'center' }}>
                        {step.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* Order Details */}
        <View style={{ backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: Colors.borderLight }}>
          <Text style={{ fontSize: FontSizes.lg, ...Fonts.extraBold, color: Colors.text, marginBottom: Spacing.md }}>Sipariş Bilgileri</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
            <Text style={{ fontSize: FontSizes.sm, color: Colors.textSecondary }}>Sipariş No</Text>
            <Text style={{ fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.text }}>#{order.id?.slice(0,8).toUpperCase()}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
            <Text style={{ fontSize: FontSizes.sm, color: Colors.textSecondary }}>Tarih</Text>
            <Text style={{ fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.text }}>{date} {time}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
            <Text style={{ fontSize: FontSizes.sm, color: Colors.textSecondary }}>Türü</Text>
            <Text style={{ fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.text }}>{isCustom ? 'Özel İstek' : order.type === 'restaurant' ? 'Restoran Siparişi' : 'Market Siparişi'}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md }}>
            <Text style={{ fontSize: FontSizes.sm, color: Colors.textSecondary }}>Ödeme</Text>
            <Text style={{ fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.text }}>{order.paymentMethod === 'cash' ? 'Kapıda Ödeme' : 'Online Kredi Kartı'}</Text>
          </View>

          <View style={{ height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.md }} />

          {/* Delivery Info */}
          <Text style={{ fontSize: FontSizes.md, ...Fonts.bold, color: Colors.text, marginBottom: Spacing.sm }}>Teslimat Adresi</Text>
          <Text style={{ fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 }}>{order.address}</Text>
          <Text style={{ fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.text, marginTop: Spacing.sm }}>{order.phone}</Text>
        </View>

        {/* Products */}
        <View style={{ backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: Colors.borderLight }}>
          <Text style={{ fontSize: FontSizes.lg, ...Fonts.extraBold, color: Colors.text, marginBottom: Spacing.md }}>İçerik</Text>
          
          {isCustom ? (
            <Text style={{ fontSize: FontSizes.sm, color: Colors.textSecondary }}>{order.customNote}</Text>
          ) : (
            order.items?.map((item, idx) => (
              <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: idx !== order.items!.length - 1 ? Spacing.sm : 0 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: FontSizes.sm, color: Colors.text }}>
                    <Text style={{ ...Fonts.bold }}>{item.quantity}x</Text> {item.name}
                  </Text>
                  {item.selectedOptions && item.selectedOptions.map((opt: any, oIdx: number) => (
                    <Text key={oIdx} style={{ fontSize: 10, color: Colors.textTertiary, marginLeft: 20 }}>
                      + {opt.choiceName}
                    </Text>
                  ))}
                </View>
                <Text style={{ fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.text }}>₺{item.price * item.quantity}</Text>
              </View>
            ))
          )}

          <View style={{ height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.md }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs }}>
            <Text style={{ fontSize: FontSizes.sm, color: Colors.textSecondary }}>Ara Toplam</Text>
            <Text style={{ fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.text }}>₺{order.totalAmount - (order.deliveryFee || 0)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md }}>
            <Text style={{ fontSize: FontSizes.sm, color: Colors.textSecondary }}>Getirme Ücreti</Text>
            <Text style={{ fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.text }}>{order.deliveryFee > 0 ? `₺${order.deliveryFee}` : 'Ücretsiz'}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: FontSizes.md, ...Fonts.extraBold, color: Colors.text }}>Toplam</Text>
            <Text style={{ fontSize: FontSizes.xl, ...Fonts.extraBold, color: Colors.primary }}>₺{order.totalAmount}</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
