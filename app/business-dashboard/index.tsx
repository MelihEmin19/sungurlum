import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import SpringButton from '@/components/ui/SpringButton';
import { useAuthStore } from '@/stores/authStore';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getFavoriteCountForTarget } from '@/services/favorites';
import { Icon } from '@/components/ui/Icon';

export default function BusinessDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [favCount, setFavCount] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'businesses'), where('ownerId', '==', user.uid));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          const bizDoc = snap.docs[0];
          const biz: any = { id: bizDoc.id, ...bizDoc.data() };
          setBusiness(biz);
          setIsOpen(biz.isOpen !== false);
          
          const count = await getFavoriteCountForTarget(biz.id);
          setFavCount(count);
        } else {
          // If not found by ownerId, maybe fallback for testing with mock data
          if (user.email === 'admin@sungurlum.com' || user.uid === 'admin123') {
             setBusiness({
               id: 'mock-biz',
               name: 'Demo İşletme',
               reviewCount: 12,
               rating: 4.5,
               businessType: 'restaurant',
               isOpen: true
             });
             setIsOpen(true);
             setFavCount(45);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const toggleOpenStatus = async () => {
    const newStatus = !isOpen;
    setIsOpen(newStatus); // optimistic update
    try {
      if (business && business.id !== 'mock-biz') {
        await updateDoc(doc(db, 'businesses', business.id), { isOpen: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Hata', 'İşletme durumu güncellenemedi.');
      setIsOpen(!newStatus); // revert on error
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }} className="bg-surface border-b border-border/20 shadow-sm">
        <View className="h-14 flex-row items-center px-4 justify-between">
          <SpringButton 
            className="w-10 h-10 items-center justify-center rounded-full bg-background/80" 
            onPress={() => router.back()}
          >
            <Icon name="arrowLeft" size={24} color="textPrimary" />
          </SpringButton>
          <Text className="text-lg font-extrabold text-textPrimary">İşletme Panelim</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 100 }} />
        ) : !business ? (
          <View className="items-center mt-20 opacity-70 px-4">
            <Icon name="store" size={48} color="muted" />
            <Text className="text-base font-medium text-textSecondary text-center mt-4">
              İşletme bilgileriniz bulunamadı. Başvurunuz henüz onaylanmamış olabilir veya sistemde bir hata oluştu.
            </Text>
          </View>
        ) : (
          <>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-extrabold text-textPrimary">Genel Bakış</Text>
              <SpringButton 
                className="flex-row items-center bg-primary/10 px-3 py-1.5 rounded-full"
                onPress={() => router.push('/business-dashboard/edit' as any)}
              >
                <Icon name="edit2" size={14} color="primary" />
                <Text className="text-sm font-bold text-primary ml-1.5">Düzenle</Text>
              </SpringButton>
            </View>

            <View className="flex-row gap-3 mb-8">
              <View className="flex-1 bg-surface p-4 rounded-xl items-center border border-border/40 shadow-sm shadow-black/5">
                <Text className="text-xl font-extrabold text-primary mb-1">245</Text>
                <Text className="text-[10px] font-bold text-textSecondary text-center uppercase">Görüntülenme</Text>
              </View>
              <View className="flex-1 bg-surface p-4 rounded-xl items-center border border-border/40 shadow-sm shadow-black/5">
                <Text className="text-xl font-extrabold text-primary mb-1">{favCount}</Text>
                <Text className="text-[10px] font-bold text-textSecondary text-center uppercase">Favori</Text>
              </View>
              <View className="flex-1 bg-surface p-4 rounded-xl items-center border border-border/40 shadow-sm shadow-black/5">
                <Text className="text-xl font-extrabold text-primary mb-1">{business.reviewCount || 0}</Text>
                <Text className="text-[10px] font-bold text-textSecondary text-center uppercase">Yorum</Text>
              </View>
            </View>

            <Text className="text-lg font-extrabold text-textPrimary mb-4">Tıklama Detayı (Bu Ay)</Text>
            <View className="bg-surface rounded-2xl border border-border/40 overflow-hidden shadow-sm shadow-black/5 mb-8">
              <MenuRow icon="phone" title="Telefonla Arama" value="22" color="success" />
              <MenuRow icon="messageCircle" title="WhatsApp Mesajı" value="11" color="primary" />
              <MenuRow icon="mapPin" title="Harita / Yol Tarifi" value="5" color="info" />
            </View>

            {business.businessType === 'restaurant' && (
              <>
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-extrabold text-textPrimary">Restoran Yönetimi</Text>
                  
                  {/* Dükkanı Aç/Kapat Toggle */}
                  <SpringButton 
                    className={`flex-row items-center px-3 py-1.5 rounded-full ${isOpen ? 'bg-success/10' : 'bg-danger/10'}`}
                    onPress={toggleOpenStatus}
                  >
                    <View className={`w-2 h-2 rounded-full mr-2 ${isOpen ? 'bg-success' : 'bg-danger'}`} />
                    <Text className={`text-sm font-bold ${isOpen ? 'text-success-700' : 'text-danger-700'}`}>
                      {isOpen ? 'Şu An Açık' : 'Şu An Kapalı'}
                    </Text>
                  </SpringButton>
                </View>

                <View className="flex-row gap-3 mb-8">
                  <SpringButton 
                    className="flex-1 p-4 rounded-2xl border bg-info/10 border-info/30"
                    onPress={() => router.push('/business-dashboard/menu' as any)}
                  >
                    <View className="w-10 h-10 rounded-xl bg-info items-center justify-center mb-2">
                      <Icon name="list" size={20} color="white" />
                    </View>
                    <Text className="text-base font-bold text-info-700">Menü</Text>
                    <Text className="text-xs font-medium text-info-700">Ürünlerini Yönet</Text>
                  </SpringButton>

                  <SpringButton 
                    className="flex-1 p-4 rounded-2xl border bg-success/10 border-success/30"
                    onPress={() => router.push('/business-dashboard/orders' as any)}
                  >
                    <View className="w-10 h-10 rounded-xl bg-success items-center justify-center mb-2">
                      <Icon name="bell" size={20} color="white" />
                    </View>
                    <Text className="text-base font-bold text-success-700">Siparişler</Text>
                    <Text className="text-xs font-medium text-success-700">Canlı Takip</Text>
                  </SpringButton>
                </View>
              </>
            )}

            <Text className="text-lg font-extrabold text-textPrimary mb-4">Promosyon</Text>
            <SpringButton 
              className="flex-row items-center bg-primary p-5 rounded-2xl shadow-md shadow-primary/30" 
              onPress={() => Alert.alert('Yakında', 'Öne çıkarma modülü yakında aktif edilecek.')}
            >
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mr-4">
                <Icon name="rocket" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-white mb-1">Daha Çok Müşteri Bulun</Text>
                <Text className="text-xs text-white/80">İşletmenizi arama sonuçlarında üst sıralara taşıyın.</Text>
              </View>
              <Icon name="chevronRight" size={20} color="white" />
            </SpringButton>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const MenuRow = ({ icon, title, value, color }: { icon: any, title: string, value: string, color: 'primary' | 'success' | 'info' | 'warning' | 'danger' }) => {
  const getColors = () => {
    switch (color) {
      case 'primary': return 'bg-primary/10 text-primary';
      case 'success': return 'bg-success/10 text-success';
      case 'info': return 'bg-info/10 text-info';
      case 'warning': return 'bg-warning/10 text-warning';
      case 'danger': return 'bg-danger/10 text-danger';
      default: return 'bg-primary/10 text-primary';
    }
  };

  return (
    <View className="flex-row items-center p-4 border-b border-border/30">
      <View className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${getColors().split(' ')[0]}`}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <Text className="flex-1 text-base font-bold text-textPrimary">{title}</Text>
      <Text className={`text-lg font-extrabold ${getColors().split(' ')[1]}`}>{value}</Text>
    </View>
  );
};
