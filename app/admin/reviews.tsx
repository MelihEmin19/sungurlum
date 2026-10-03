import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import SpringButton from '@/components/ui/SpringButton';
import { getAllReviews, deleteReview, Review } from '@/services/reviews';
import { Icon } from '@/components/ui/Icon';

export default function AdminReviewsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getAllReviews();
      setReviews(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Yorumlar yüklenemedi. (İndeks oluşturulmamış olabilir)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (review: Review) => {
    Alert.alert('Uyarı', 'Bu yorumu tamamen silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          if (review.id) {
            await deleteReview(review.id, review.businessId, review.rating);
            fetchReviews();
          }
        } catch (e) {
          Alert.alert('Hata', 'Silinemedi.');
        }
      }}
    ]);
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
          <Text className="text-lg font-extrabold text-textPrimary">Yorum Moderasyonu</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
        ) : reviews.length === 0 ? (
          <View className="items-center mt-20 opacity-70">
            <Icon name="messageSquare" size={48} color="muted" />
            <Text className="text-base font-medium text-textSecondary mt-4">Sistemde henüz yorum yok.</Text>
          </View>
        ) : (
          reviews.map((r) => (
            <View key={r.id} className="bg-surface rounded-2xl p-5 mb-4 border border-border/40 shadow-sm shadow-black/5">
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center gap-2">
                  <Icon name="user" size={18} color="textSecondary" />
                  <Text className="text-sm font-bold text-textPrimary">{r.userName}</Text>
                </View>
                <View className="flex-row items-center bg-warning/10 px-2.5 py-1 rounded-full gap-1 border border-warning/20">
                  <Icon name="star" size={12} color="warning" />
                  <Text className="text-xs font-extrabold text-warning">{r.rating}</Text>
                </View>
              </View>
              
              <Text className="text-base text-textSecondary leading-6 mb-4">{r.comment}</Text>
              
              <View className="flex-row justify-end pt-4 border-t border-border/30">
                <SpringButton 
                  className="flex-row items-center bg-danger/10 px-4 py-2 rounded-lg border border-danger/20" 
                  onPress={() => handleDelete(r)}
                >
                  <Icon name="trash2" size={16} color="danger" />
                  <Text className="text-sm font-bold text-danger ml-2">Sil / Kaldır</Text>
                </SpringButton>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
