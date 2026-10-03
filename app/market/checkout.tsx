import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import SpringButton from '@/components/ui/SpringButton';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import CreditCard3D from '@/components/ui/CreditCard3D';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { createOrder } from '@/services/orders';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth, app } from '@/config/firebase';
import SuccessModal from '@/components/ui/SuccessModal';
import { hapticSuccess, hapticMedium } from '@/utils/haptics';
import Toast from 'react-native-toast-message';
export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const cart = useCartStore();
  
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card_online'>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [minCartValue, setMinCartValue] = useState(0);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(true);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // Credit Card States
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);

  // Phone Verification States
  const [isPhoneVerified, setIsPhoneVerified] = useState(true);

  const productsTotal = cart.getTotalPrice();
  const totalAmount = productsTotal + deliveryFee;

  useEffect(() => {
    const fetchBusinessConfig = async () => {
      try {
        if (!cart.businessId || cart.businessId === 'admin') {
          setDeliveryFee(20);
          setMinCartValue(300);
          setIsLoadingBusiness(false);
          return;
        }

        const docRef = doc(db, 'businesses', cart.businessId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDeliveryFee(data.deliveryFee || 0);
          setMinCartValue(data.minOrderAmount || 100);
        } else {
          setDeliveryFee(0);
          setMinCartValue(100);
        }
      } catch (error) {
        console.error('Error fetching business info:', error);
      } finally {
        setIsLoadingBusiness(false);
      }
    };
    fetchBusinessConfig();
  }, [cart.businessId]);

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedAddr = await AsyncStorage.getItem('@saved_address');
        if (savedAddr) setAddress(savedAddr);
      } catch (error) {
        console.log('Error loading saved data', error);
      }
    };
    loadSavedData();
  }, [user]);

  const submitOrder = async () => {
    try {
      setIsSubmitting(true);
      await AsyncStorage.setItem('@saved_address', address);
      
      const orderData: any = {
        userId: user!.uid,
        userName: user!.displayName || 'İsimsiz Kullanıcı',
        phone,
        address,
        type: cart.businessId === 'admin' ? 'market' : 'restaurant',
        items: cart.items,
        totalAmount: totalAmount,
        deliveryFee: deliveryFee,
        paymentMethod,
        status: 'pending',
      };
      
      if (cart.businessId && cart.businessId !== 'admin') {
        orderData.businessId = cart.businessId;
      }
      
      const cleanOrderData = JSON.parse(JSON.stringify(orderData));
      await createOrder(cleanOrderData);
      
      cart.clearCart();
      hapticSuccess();
      setSuccessModalVisible(true);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Siparişiniz oluşturulamadı.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    hapticMedium();
    if (cart.items.length === 0) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Sepetiniz boş.' });
      return;
    }
    if (!address.trim()) {
      Toast.show({ type: 'error', text1: 'Eksik Bilgi', text2: 'Lütfen açık adresinizi girin.' });
      return;
    }
    if (productsTotal < minCartValue) {
      Toast.show({ type: 'error', text1: 'Alt Limit Hatası', text2: `Sipariş verebilmek için sepet tutarınız minimum ${minCartValue} ₺ olmalıdır.` });
      return;
    }
    if (!user) {
      Toast.show({ type: 'error', text1: 'Giriş Yapın', text2: 'Sipariş vermek için üye girişi yapmalısınız.' });
      router.push('/auth/login');
      return;
    }
    
    if (paymentMethod === 'credit_card_online') {
      Toast.show({ type: 'info', text1: 'Bilgi', text2: 'Online ödeme entegrasyon aşamasında. Lütfen kapıda ödemeyi seçin.' });
      return;
    }

    if (!phone.trim()) {
       Toast.show({ type: 'error', text1: 'Eksik Bilgi', text2: 'Kuryenin size ulaşabilmesi için telefon numaranızı girin.' });
       return;
    }

    // If everything is fine and verified, submit order
    submitOrder();
  };

  if (cart.items.length === 0 && !successModalVisible) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-5">
        <Icon name="shoppingBag" size={64} color="border" />
        <Text className="text-lg font-bold text-textSecondary mt-4 text-center">Sepetiniz şu an boş.</Text>
        <SpringButton 
          className="mt-6 bg-primary px-6 py-3 rounded-full"
          onPress={() => router.replace('/' as any)}
        >
          <Text className="text-white font-bold">Ana Sayfaya Dön</Text>
        </SpringButton>
      </View>
    );
  }

  if (isLoadingBusiness) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-background"
    >
      <View style={{ paddingTop: insets.top }} className="bg-surface border-b border-border/20 z-10">
        <View className="h-14 flex-row items-center px-4 justify-between">
          <SpringButton className="w-10 h-10 items-center justify-center rounded-full bg-background" onPress={() => router.back()}>
            <Icon name="arrowLeft" size={24} color="textPrimary" />
          </SpringButton>
          <Text className="text-lg font-extrabold text-textPrimary">Sepet Onayı</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 240 + (productsTotal < minCartValue ? 60 : 0) }}>
        
        {/* Cart Items Summary */}
        <View className="bg-surface rounded-2xl p-4 border border-border/40 shadow-sm shadow-black/5 mb-6">
          <Text className="text-base font-bold text-textPrimary mb-4">Sipariş Özeti</Text>
          {cart.items.map((item, index) => (
            <View key={item.id} className={`flex-row justify-between items-center ${index !== cart.items.length - 1 ? 'mb-3 pb-3 border-b border-border/30' : ''}`}>
              <View className="flex-row items-center flex-1">
                <Text className="text-sm font-bold text-primary mr-2">{item.quantity}x</Text>
                <Text className="text-sm font-medium text-textPrimary flex-1" numberOfLines={1}>{item.name}</Text>
              </View>
              <Text className="text-sm font-bold text-textSecondary">₺{item.price * item.quantity}</Text>
            </View>
          ))}
        </View>

        {/* Saved Addresses */}
        {user?.addresses && user.addresses.length > 0 && (
          <View className="mb-6">
            <Text className="text-sm font-bold text-textSecondary mb-2 ml-1">Kayıtlı Adreslerim</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-1 pb-2">
              {user.addresses.map(addr => (
                <SpringButton
                  key={addr.id}
                  className={`p-3 mr-3 rounded-xl border ${selectedSavedAddressId === addr.id ? 'bg-primary/10 border-primary' : 'bg-surface border-border/40'}`}
                  style={{ width: 150 }}
                  onPress={() => {
                    setSelectedSavedAddressId(addr.id);
                    setAddress(addr.address);
                  }}
                >
                  <View className="flex-row items-center mb-1">
                    <Icon name={addr.title.toLowerCase().includes('ev') ? 'home' : addr.title.toLowerCase().includes('iş') ? 'briefcase' : 'mapPin'} size={14} color={selectedSavedAddressId === addr.id ? Colors.primary : Colors.textSecondary} />
                    <Text className={`ml-1.5 font-bold text-sm ${selectedSavedAddressId === addr.id ? 'text-primary' : 'text-textPrimary'}`} numberOfLines={1}>{addr.title}</Text>
                  </View>
                  <Text className="text-xs text-textSecondary" numberOfLines={2}>{addr.address}</Text>
                </SpringButton>
              ))}
            </ScrollView>
          </View>
        )}

        <Text className="text-sm font-bold text-textSecondary mb-2 ml-1">Teslimat Adresi</Text>
        <TextInput
          className="bg-surface p-4 rounded-2xl border border-border/40 text-base text-textPrimary h-24 mb-6"
          placeholder="Açık adresinizi buraya yazın..."
          placeholderTextColor="#94A3B8"
          multiline
          textAlignVertical="top"
          value={address}
          onChangeText={(text) => {
            setAddress(text);
            setSelectedSavedAddressId(null);
          }}
        />

        <View className="mb-8">
          <Text className="text-sm font-bold text-textSecondary mb-2 ml-1">İletişim Numarası</Text>
          <View className="bg-surface p-2 rounded-2xl border border-border/40 flex-row items-center">
            <View className="w-10 h-10 items-center justify-center">
              <Icon name="phone" size={18} color={Colors.textSecondary} />
            </View>
            <TextInput
              className="flex-1 text-base text-textPrimary font-medium py-2"
              placeholder="05XX XXX XX XX"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>

        <Text className="text-sm font-bold text-textSecondary mb-2 ml-1">Ödeme Yöntemi</Text>
        <View className="flex-row gap-3 mb-8">
          <SpringButton 
            className={`flex-1 p-4 rounded-2xl border ${paymentMethod === 'cash' ? 'bg-primary/10 border-primary' : 'bg-surface border-border/40'}`}
            onPress={() => setPaymentMethod('cash')}
          >
            <View className={`w-8 h-8 rounded-full items-center justify-center mb-2 ${paymentMethod === 'cash' ? 'bg-primary' : 'bg-background'}`}>
              <Icon name="banknote" size={16} color={paymentMethod === 'cash' ? '#FFFFFF' : Colors.textSecondary} />
            </View>
            <Text className={`font-bold ${paymentMethod === 'cash' ? 'text-primary' : 'text-textSecondary'}`}>Kapıda Ödeme</Text>
            <Text className="text-xs text-textTertiary mt-1">(Nakit veya POS)</Text>
          </SpringButton>

          <SpringButton 
            className={`flex-1 p-4 rounded-2xl border ${paymentMethod === 'credit_card_online' ? 'bg-primary/10 border-primary' : 'bg-surface border-border/40'}`}
            onPress={() => setPaymentMethod('credit_card_online')}
          >
            <View className={`w-8 h-8 rounded-full items-center justify-center mb-2 ${paymentMethod === 'credit_card_online' ? 'bg-primary' : 'bg-background'}`}>
              <Icon name="creditCard" size={16} color={paymentMethod === 'credit_card_online' ? '#FFFFFF' : Colors.textSecondary} />
            </View>
            <Text className={`font-bold ${paymentMethod === 'credit_card_online' ? 'text-primary' : 'text-textSecondary'}`}>Online Ödeme</Text>
            <Text className="text-xs text-textTertiary mt-1">(Kredi/Banka Kartı)</Text>
          </SpringButton>
        </View>

        {paymentMethod === 'credit_card_online' && (
          <View className="mb-8">
            <CreditCard3D 
              cardNumber={cardNumber}
              cardHolder={cardHolder}
              expiry={expiry}
              cvv={cvv}
              isFlipped={isFlipped}
            />
            
            <View className="bg-surface p-4 rounded-2xl border border-border/40 mt-4">
              <Text className="text-xs font-bold text-textSecondary mb-1 ml-1">KART SAHİBİ</Text>
              <TextInput
                className="bg-background p-4 rounded-xl border border-border/20 text-base text-textPrimary mb-3 font-medium"
                placeholder="İsim Soyisim"
                placeholderTextColor="#94A3B8"
                value={cardHolder}
                onChangeText={setCardHolder}
                onFocus={() => setIsFlipped(false)}
              />

              <Text className="text-xs font-bold text-textSecondary mb-1 ml-1">KART NUMARASI</Text>
              <TextInput
                className="bg-background p-4 rounded-xl border border-border/20 text-base text-textPrimary mb-3 font-medium"
                placeholder="0000 0000 0000 0000"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={16}
                value={cardNumber}
                onChangeText={setCardNumber}
                onFocus={() => setIsFlipped(false)}
              />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-textSecondary mb-1 ml-1">SKT (AA/YY)</Text>
                  <TextInput
                    className="bg-background p-4 rounded-xl border border-border/20 text-base text-textPrimary font-medium"
                    placeholder="MM/YY"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={5}
                    value={expiry}
                    onChangeText={setExpiry}
                    onFocus={() => setIsFlipped(false)}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-textSecondary mb-1 ml-1">CVV</Text>
                  <TextInput
                    className="bg-background p-4 rounded-xl border border-border/20 text-base text-textPrimary font-medium"
                    placeholder="***"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={3}
                    value={cvv}
                    onChangeText={setCvv}
                    onFocus={() => setIsFlipped(true)}
                    onBlur={() => setIsFlipped(false)}
                  />
                </View>
              </View>
            </View>
          </View>
        )}

      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 p-5 bg-surface border-t border-border/20 shadow-lg" style={{ paddingBottom: Math.max(insets.bottom, 20) + (productsTotal < minCartValue ? 60 : 0) }}>
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm font-medium text-textSecondary">Ara Toplam</Text>
          <AnimatedNumber value={productsTotal} prefix="₺" style={{ fontSize: 14, color: Colors.text }} />
        </View>
        <View className="flex-row justify-between mb-4">
          <Text className="text-sm font-medium text-textSecondary">Teslimat Ücreti</Text>
          <Text className="text-sm font-medium text-textPrimary">₺{deliveryFee.toFixed(2)}</Text>
        </View>
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-base font-bold text-textPrimary">Toplam</Text>
          <AnimatedNumber value={totalAmount} prefix="₺" style={{ fontSize: 24, color: Colors.primary }} />
        </View>

        <SpringButton 
          className={`w-full h-14 rounded-2xl items-center justify-center shadow-lg ${productsTotal < minCartValue ? 'bg-border shadow-none' : 'bg-primary shadow-primary/30'}`}
          onPress={handleSubmit}
          disabled={isSubmitting || productsTotal < minCartValue}
        >
          <Text className="text-white font-extrabold text-lg">
            {productsTotal < minCartValue ? `Minimum ${minCartValue} ₺ Sepet Tutarı` : isSubmitting ? 'İşleniyor...' : 'Siparişi Onayla'}
          </Text>
        </SpringButton>
      </View>

      <SuccessModal
        visible={successModalVisible}
        title="Sipariş Alındı!"
        message="Siparişiniz başarıyla alındı. Siparişlerim sayfasından anlık olarak takip edebilirsiniz."
        onClose={() => {
          setSuccessModalVisible(false);
          router.replace('/my-orders' as any);
        }}
      />
    </KeyboardAvoidingView>
  );
}
