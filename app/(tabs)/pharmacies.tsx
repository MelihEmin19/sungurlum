import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpringButton from '@/components/ui/SpringButton';
import { Icon } from '@/components/ui/Icon';
import { getPharmaciesForToday, DutyPharmacy } from '@/services/pharmacies';

export default function PharmaciesScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [pharmacies, setPharmacies] = useState<DutyPharmacy[]>([]);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const data = await getPharmaciesForToday();
        setPharmacies(data);
      } catch (error) {
        console.error('Error fetching pharmacies', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPharmacies();
  }, []);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  };

  const handleMap = (name: string) => {
    Linking.openURL(`https://maps.google.com/?q=${name} Sungurlu`);
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }} className="px-5 pt-4 pb-3 bg-surface border-b border-border/20 shadow-sm flex-row justify-between items-center">
        <Text className="text-2xl font-extrabold text-textPrimary tracking-tight">Nöbetçi Eczaneler</Text>
        <Text className="text-sm font-bold text-danger">{new Date().toLocaleDateString('tr-TR')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        
        <View className="flex-row bg-danger/10 p-4 rounded-xl mb-6 items-center border border-danger/20">
          <Icon name="info" size={24} color="danger" />
          <Text className="flex-1 ml-3 text-sm font-medium text-danger">
            Bu listedeki eczaneler gece saat 23:59'a kadar veya ertesi sabaha kadar nöbetçidir.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#EF4444" style={{ marginTop: 40 }} />
        ) : (
          pharmacies.map((pharmacy) => (
            <View key={pharmacy.id} className="bg-surface rounded-2xl p-5 mb-5 border border-border/40 shadow-sm shadow-black/5">
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 rounded-full bg-danger/10 items-center justify-center mr-3">
                  <Icon name="pill" size={16} color="danger" />
                </View>
                <Text className="text-lg font-bold text-textPrimary">{pharmacy.name}</Text>
              </View>
              
              <Text className="text-sm font-medium text-textSecondary leading-5 mb-5 pl-11">{pharmacy.address}</Text>

              <View className="flex-row gap-3">
                <SpringButton 
                  className="flex-1 flex-row items-center justify-center bg-danger/10 py-3 rounded-xl border border-danger/20"
                  onPress={() => handleCall(pharmacy.phone)}
                >
                  <Icon name="phone" size={16} color="danger" />
                  <Text className="text-sm font-bold text-danger ml-2">{pharmacy.phone}</Text>
                </SpringButton>

                <SpringButton 
                  className="flex-1 flex-row items-center justify-center bg-primary/10 py-3 rounded-xl border border-primary/20"
                  onPress={() => handleMap(pharmacy.name)}
                >
                  <Icon name="mapPin" size={16} color="primary" />
                  <Text className="text-sm font-bold text-primary ml-2">Yol Tarifi</Text>
                </SpringButton>
              </View>
            </View>
          ))
        )}

        {!loading && pharmacies.length === 0 && (
          <View className="items-center mt-10 opacity-50">
            <Icon name="alertCircle" size={48} color="muted" />
            <Text className="text-base font-bold text-textSecondary mt-3">Bugün için henüz nöbetçi eczane girilmemiş.</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}
