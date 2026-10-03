import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import SpringButton from '@/components/ui/SpringButton';
import { Colors } from '@/theme';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Siparişiniz Yola Çıktı!',
    message: 'Market siparişiniz kuryemiz tarafından yola çıkarıldı. Yaklaşık 10 dakika içinde kapınızda olacak.',
    time: '5 dakika önce',
    type: 'success',
    icon: 'shoppingBag',
    read: false,
  },
  {
    id: '2',
    title: 'Yeni Kampanya: Sungurlu Pidecisi',
    message: 'Sungurlu Pidecisi\'nde tüm pide çeşitlerinde bugün geçerli %20 indirim fırsatını kaçırmayın!',
    time: '2 saat önce',
    type: 'warning',
    icon: 'star',
    read: false,
  },
  {
    id: '3',
    title: 'Belediye Duyurusu',
    message: 'Yarın saat 10:00 ile 14:00 arasında Fatih Mahallesi\'nde su kesintisi yaşanacaktır.',
    time: '1 gün önce',
    type: 'info',
    icon: 'info',
    read: true,
  },
  {
    id: '4',
    title: 'Esnaf Başvurunuz Onaylandı!',
    message: 'Tebrikler, esnaf başvurunuz onaylandı. İşletme profilinize girip görsellerinizi ekleyebilirsiniz.',
    time: '2 gün önce',
    type: 'primary',
    icon: 'checkCircle',
    read: true,
  }
];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return Colors.success;
      case 'warning': return Colors.warning;
      case 'danger': return Colors.danger;
      case 'info': return Colors.info;
      default: return Colors.primary;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-success/10';
      case 'warning': return 'bg-warning/10';
      case 'danger': return 'bg-error/10';
      case 'info': return 'bg-info/10';
      default: return 'bg-primary/10';
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
          <Text className="text-lg font-extrabold text-textPrimary">Bildirimler</Text>
          <SpringButton className="w-10 h-10 items-center justify-center rounded-full bg-background">
            <Icon name="checkSquare" size={20} color="primary" />
          </SpringButton>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {MOCK_NOTIFICATIONS.length > 0 ? (
          MOCK_NOTIFICATIONS.map((notification) => (
            <SpringButton 
              key={notification.id} 
              className={`p-4 rounded-2xl mb-3 flex-row border ${notification.read ? 'bg-surface border-border/40' : 'bg-primary/5 border-primary/20 shadow-sm shadow-primary/10'}`}
              onPress={() => {}}
            >
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${getBgColor(notification.type)}`}>
                <Icon name={notification.icon as any} size={24} color={getIconColor(notification.type) as any} />
              </View>
              <View className="flex-1">
                <View className="flex-row justify-between items-start mb-1">
                  <Text className={`flex-1 text-base font-extrabold mr-2 ${notification.read ? 'text-textPrimary' : 'text-primary'}`}>
                    {notification.title}
                  </Text>
                  <Text className="text-xs font-medium text-textTertiary mt-1">{notification.time}</Text>
                </View>
                <Text className="text-sm font-medium text-textSecondary leading-5">
                  {notification.message}
                </Text>
              </View>
            </SpringButton>
          ))
        ) : (
          <View className="items-center justify-center mt-20">
            <View className="w-24 h-24 rounded-full bg-surface items-center justify-center shadow-sm shadow-black/5 mb-6 border border-border/50">
              <Icon name="bellOff" size={40} color="textTertiary" />
            </View>
            <Text className="text-xl font-extrabold text-textPrimary mb-2 text-center">Henüz Bildirim Yok</Text>
            <Text className="text-sm font-medium text-textSecondary text-center px-4">
              Sizin için önemli olan bildirimleri (Sipariş durumu, kampanya ve duyurular) burada görebilirsiniz.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
