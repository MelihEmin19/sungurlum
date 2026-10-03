import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import SpringButton from '@/components/ui/SpringButton';
import { getCampaigns, updateCampaignStatus, deleteCampaign } from '@/services/campaigns';
import { Campaign } from '@/constants/mockData';
import { Icon } from '@/components/ui/Icon';

export default function AdminCampaignsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await getCampaigns();
      setCampaigns(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleStatusChange = async (id: string, status: 'active' | 'rejected') => {
    try {
      await updateCampaignStatus(id, status);
      fetchCampaigns();
    } catch (e) {
      Alert.alert('Hata', 'İşlem başarısız.');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Uyarı', 'Bu kampanyayı tamamen silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        await deleteCampaign(id);
        fetchCampaigns();
      }}
    ]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-success/10', text: 'text-success', label: 'AKTİF' };
      case 'pending':
        return { bg: 'bg-warning/10', text: 'text-warning', label: 'BEKLİYOR' };
      case 'rejected':
        return { bg: 'bg-danger/10', text: 'text-danger', label: 'REDDEDİLDİ' };
      default:
        return { bg: 'bg-muted/10', text: 'text-muted', label: 'SÜRESİ DOLDU' };
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
          <Text className="text-lg font-extrabold text-textPrimary">Reklam / Kampanyalar</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
        ) : campaigns.length === 0 ? (
          <View className="items-center mt-20 opacity-70">
            <Icon name="megaphone" size={48} color="muted" />
            <Text className="text-base font-medium text-textSecondary mt-4">Henüz hiç kampanya yok.</Text>
          </View>
        ) : (
          campaigns.map((c) => {
            const badge = getStatusBadge(c.status);
            return (
              <View key={c.id} className="bg-surface rounded-2xl p-5 mb-5 border border-border/40 shadow-sm shadow-black/5">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm font-bold text-primary">{c.businessName}</Text>
                  <View className={`px-2 py-1 rounded-md ${badge.bg}`}>
                    <Text className={`text-[10px] font-bold ${badge.text}`}>{badge.label}</Text>
                  </View>
                </View>
                
                <Text className="text-lg font-extrabold text-textPrimary mb-1">{c.title}</Text>
                <Text className="text-sm text-textSecondary mb-5 leading-5">{c.description}</Text>
                
                <View className="flex-row items-center gap-3 pt-4 border-t border-border/30">
                  {c.status === 'pending' && (
                    <>
                      <SpringButton 
                        className="flex-1 bg-success py-2.5 rounded-xl items-center border border-success" 
                        onPress={() => handleStatusChange(c.id, 'active')}
                      >
                        <Text className="text-white font-bold text-sm">Onayla</Text>
                      </SpringButton>
                      <SpringButton 
                        className="flex-1 bg-surface py-2.5 rounded-xl items-center border border-border" 
                        onPress={() => handleStatusChange(c.id, 'rejected')}
                      >
                        <Text className="text-textPrimary font-bold text-sm">Reddet</Text>
                      </SpringButton>
                    </>
                  )}
                  {c.status === 'active' && (
                    <SpringButton 
                      className="flex-1 bg-surface py-2.5 rounded-xl items-center border border-border" 
                      onPress={() => handleStatusChange(c.id, 'rejected')}
                    >
                      <Text className="text-textPrimary font-bold text-sm">Yayından Kaldır</Text>
                    </SpringButton>
                  )}
                  <SpringButton 
                    className="w-11 h-11 bg-danger/10 items-center justify-center rounded-xl ml-auto" 
                    onPress={() => handleDelete(c.id)}
                  >
                    <Icon name="trash2" size={20} color="danger" />
                  </SpringButton>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
