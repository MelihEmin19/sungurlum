import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import SpringButton from '@/components/ui/SpringButton';
import { collection, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Icon } from '@/components/ui/Icon';

export default function AdminStatisticsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [stats, setStats] = useState({
    users: 0,
    businesses: 0,
    classifieds: 0,
    reviews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { getCountFromServer } = require('firebase/firestore');
        
        const usersSnap = await getCountFromServer(collection(db, 'users'));
        const bizSnap = await getCountFromServer(query(collection(db, 'businesses'), where('status', '==', 'approved')));
        const adsSnap = await getCountFromServer(query(collection(db, 'classifieds'), where('status', '==', 'approved')));
        const reviewsSnap = await getCountFromServer(collection(db, 'reviews'));

        setStats({
          users: usersSnap.data().count,
          businesses: bizSnap.data().count,
          classifieds: adsSnap.data().count,
          reviews: reviewsSnap.data().count
        });
      } catch (error) {
        console.error('Stats error:', error);
        Alert.alert('Hata', 'İstatistikler çekilemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
          <Text className="text-lg font-extrabold text-textPrimary">İstatistikler</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
        ) : (
          <View className="flex-row flex-wrap justify-between gap-y-4">
            <StatCard icon="users" title="Kayıtlı Kullanıcı" value={stats.users.toString()} color="primary" />
            <StatCard icon="store" title="Onaylı İşletme" value={stats.businesses.toString()} color="success" />
            <StatCard icon="tag" title="Aktif İlanlar" value={stats.classifieds.toString()} color="warning" />
            <StatCard icon="messageSquare" title="Toplam Yorum" value={stats.reviews.toString()} color="info" />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const StatCard = ({ icon, title, value, color }: { icon: any, title: string, value: string, color: 'primary' | 'success' | 'warning' | 'info' }) => {
  const getColors = () => {
    switch (color) {
      case 'primary': return 'bg-primary/10 text-primary';
      case 'success': return 'bg-success/10 text-success';
      case 'warning': return 'bg-warning/10 text-warning';
      case 'info': return 'bg-info/10 text-info';
      default: return 'bg-primary/10 text-primary';
    }
  };
  
  return (
    <View className="w-[48%] bg-surface p-5 rounded-2xl items-center border border-border/40 shadow-sm shadow-black/5">
      <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${getColors().split(' ')[0]}`}>
        <Icon name={icon} size={32} color={color} />
      </View>
      <Text className="text-3xl font-extrabold text-textPrimary mb-1">{value}</Text>
      <Text className="text-xs font-bold text-textSecondary text-center uppercase tracking-wider">{title}</Text>
    </View>
  );
};
