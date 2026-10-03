import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius, Shadows } from '@/constants/theme';
import SpringButton from '@/components/ui/SpringButton';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function AdminClassifiedsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [pendingAds, setPendingAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPendingAds = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'classifieds'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      const ads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingAds(ads);
    } catch (error) {
      console.error('İlanlar çekilemedi:', error);
      Alert.alert('Hata', 'Bekleyen ilanlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAds();
  }, []);

  const handleApprove = async (id: string) => {
    Alert.alert('Onayla', 'Bu ilanı yayına almak istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Onayla',
        style: 'default',
        onPress: async () => {
          try {
            setProcessingId(id);
            await updateDoc(doc(db, 'classifieds', id), {
              status: 'approved',
              approvedAt: serverTimestamp()
            });
            Alert.alert('Başarılı', 'İlan yayına alındı.');
            fetchPendingAds();
          } catch (e) {
            Alert.alert('Hata', 'İlan onaylanamadı.');
          } finally {
            setProcessingId(null);
          }
        }
      }
    ]);
  };

  const handleReject = async (id: string) => {
    Alert.alert('Reddet', 'Bu ilanı reddetmek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Reddet',
        style: 'destructive',
        onPress: async () => {
          try {
            setProcessingId(id);
            await updateDoc(doc(db, 'classifieds', id), {
              status: 'rejected',
              rejectedAt: serverTimestamp()
            });
            Alert.alert('Başarılı', 'İlan reddedildi.');
            fetchPendingAds();
          } catch (e) {
            Alert.alert('Hata', 'İlan reddedilemedi.');
          } finally {
            setProcessingId(null);
          }
        }
      }
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <SpringButton style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </SpringButton>
        <Text style={styles.headerTitle}>Bekleyen İlanlar</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : pendingAds.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="check-circle-outline" size={48} color={Colors.success} />
            <Text style={styles.emptyStateText}>Tüm ilanlar incelendi. Bekleyen ilan yok!</Text>
          </View>
        ) : (
          pendingAds.map((ad) => (
            <View key={ad.id} style={styles.adCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.adTitle}>{ad.title}</Text>
                <Text style={styles.adPrice}>{ad.price} ₺</Text>
              </View>
              
              <Text style={styles.adUser}>
                <MaterialCommunityIcons name="account" size={14} color={Colors.textSecondary} /> {ad.userName}
              </Text>
              
              <Text style={styles.adDesc}>{ad.description}</Text>

              {ad.images && ad.images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  {ad.images.map((img: string, i: number) => (
                    <Image key={i} source={{ uri: img }} style={{ width: 100, height: 100, borderRadius: 8, marginRight: 8 }} />
                  ))}
                </ScrollView>
              )}

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.btn, styles.btnReject]} 
                  onPress={() => handleReject(ad.id)}
                  disabled={processingId === ad.id}
                >
                  <Text style={styles.btnRejectText}>Reddet</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btn, styles.btnApprove]} 
                  onPress={() => handleApprove(ad.id)}
                  disabled={processingId === ad.id}
                >
                  <Text style={styles.btnApproveText}>Onayla</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, backgroundColor: Colors.surface },
  backButton: { width: 44, height: 44, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.lg, ...Fonts.extraBold, color: Colors.text },
  content: { padding: Spacing.xl },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80, opacity: 0.8 },
  emptyStateText: { marginTop: Spacing.md, fontSize: FontSizes.md, ...Fonts.medium, color: Colors.textSecondary },
  adCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  adTitle: { flex: 1, fontSize: FontSizes.lg, ...Fonts.bold, color: Colors.text, marginRight: 8 },
  adPrice: { fontSize: FontSizes.lg, ...Fonts.extraBold, color: Colors.primary },
  adUser: { fontSize: FontSizes.sm, ...Fonts.medium, color: Colors.textSecondary, marginBottom: Spacing.sm },
  adDesc: { fontSize: FontSizes.md, color: Colors.text, marginBottom: Spacing.lg },
  actionButtons: { flexDirection: 'row', gap: Spacing.md },
  btn: { flex: 1, paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  btnReject: { backgroundColor: Colors.errorLight, borderWidth: 1, borderColor: Colors.error + '50' },
  btnRejectText: { color: Colors.error, ...Fonts.bold },
  btnApprove: { backgroundColor: Colors.success },
  btnApproveText: { color: '#FFF', ...Fonts.bold },
});
