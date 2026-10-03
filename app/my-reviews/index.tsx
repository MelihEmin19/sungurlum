import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import SpringButton from '@/components/ui/SpringButton';
import { Icon } from '@/components/ui/Icon';
import { getUserReviews, deleteReview, Review } from '@/services/reviews';

export default function MyReviewsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);

  const fetchReviews = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getUserReviews(user.uid);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      Alert.alert('Hata', 'Yorumlarınız yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [user]);

  const handleDelete = (review: Review) => {
    if (!review.id) return;
    Alert.alert('Yorumu Sil', 'Bu yorumu silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { 
        text: 'Sil', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReview(review.id!, review.businessId, review.rating);
            setReviews(reviews.filter(r => r.id !== review.id));
            Alert.alert('Başarılı', 'Yorumunuz silindi.');
          } catch (error) {
            Alert.alert('Hata', 'Yorum silinirken bir sorun oluştu.');
          }
        }
      }
    ]);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon 
          key={i} 
          name="star" 
          size={14} 
          color={i <= rating ? "warning" : "border"} 
          strokeWidth={i <= rating ? 0 : 2}
        />
      );
    }
    return <View className="flex-row gap-1">{stars}</View>;
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
          <Text className="text-lg font-extrabold text-textPrimary">Yorumlarım</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
        ) : reviews.length === 0 ? (
          <View className="items-center justify-center mt-20 opacity-60">
            <Icon name="messageSquare" size={64} color="muted" />
            <Text className="text-base font-bold text-textSecondary mt-4 text-center px-4">
              Henüz bir işletmeye yorum yapmadınız.
            </Text>
          </View>
        ) : (
          reviews.map(review => (
            <View key={review.id} className="bg-surface p-5 rounded-2xl mb-4 border border-border/40 shadow-sm shadow-black/5">
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  {renderStars(review.rating)}
                  <Text className="text-xs font-medium text-textTertiary mt-1">
                    {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString('tr-TR') : 'Tarih Yok'}
                  </Text>
                </View>
                <SpringButton 
                  className="bg-danger/10 w-8 h-8 rounded-full items-center justify-center"
                  onPress={() => handleDelete(review)}
                >
                  <Icon name="trash2" size={16} color="danger" />
                </SpringButton>
              </View>
              
              <Text className="text-sm font-medium text-textPrimary leading-5 mt-2">
                {review.comment}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
