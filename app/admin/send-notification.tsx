import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius } from '@/constants/theme';
import SpringButton from '@/components/ui/SpringButton';
import { useAuthStore } from '@/stores/authStore';
import { db } from '@/config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { sendPushNotification } from '@/services/notifications';

export default function SendNotificationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (user?.role !== 'admin') {
      router.replace('/' as any);
    }
  }, [user]);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Hata', 'Lütfen başlık ve mesaj girin.');
      return;
    }

    Alert.alert(
      'Onay',
      'Bu mesaj tüm kullanıcılara gönderilecektir. Onaylıyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Evet, Gönder', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const usersRef = collection(db, 'users');
              const snapshot = await getDocs(usersRef);
              let successCount = 0;

              // Toplu gönderim (Firestore'dan pushToken'ı olan herkesi bul)
              const promises = snapshot.docs.map(async (docSnap) => {
                const userData = docSnap.data();
                if (userData.pushToken) {
                  await sendPushNotification(userData.pushToken, title.trim(), body.trim(), { source: 'admin_broadcast' });
                  successCount++;
                }
              });

              await Promise.all(promises);
              Alert.alert('Başarılı', `${successCount} kullanıcıya bildirim başarıyla gönderildi.`);
              setTitle('');
              setBody('');
            } catch (error) {
              console.error('Push notification error:', error);
              Alert.alert('Hata', 'Bildirim gönderilirken bir sorun oluştu.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <SpringButton style={styles.iconButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </SpringButton>
        <Text style={styles.headerTitle}>Bildirim Gönder</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information" size={24} color={Colors.primary} />
          <Text style={styles.infoText}>
            Buradan göndereceğiniz bildirimler, uygulamayı cihazına yüklemiş ve bildirim izni vermiş tüm kullanıcılara anında iletilir.
          </Text>
        </View>

        <Text style={styles.label}>Bildirim Başlığı</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: Hafta Sonu İndirimi!"
          placeholderTextColor={Colors.textTertiary}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Mesaj İçeriği</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Örn: Marketimizde tüm ürünlerde %20 indirim fırsatını kaçırmayın..."
          placeholderTextColor={Colors.textTertiary}
          multiline
          textAlignVertical="top"
          value={body}
          onChangeText={setBody}
        />

        <SpringButton 
          style={[styles.submitButton, (!title || !body || isLoading) && styles.submitButtonDisabled]}
          onPress={handleSend}
          disabled={!title || !body || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="send" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>Tümüne Gönder</Text>
            </>
          )}
        </SpringButton>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  iconButton: { width: 44, height: 44, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.xl, ...Fonts.extraBold, color: Colors.text },
  content: { padding: Spacing.xl },
  infoBox: { flexDirection: 'row', padding: Spacing.md, borderRadius: BorderRadius.md, backgroundColor: Colors.primaryLight, alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
  infoText: { flex: 1, fontSize: FontSizes.sm, ...Fonts.medium, color: Colors.primary, lineHeight: 20 },
  label: { fontSize: FontSizes.md, ...Fonts.bold, color: Colors.text, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderLight, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSizes.md, color: Colors.text, marginBottom: Spacing.lg },
  textArea: { height: 120 },
  submitButton: { flexDirection: 'row', backgroundColor: Colors.primary, padding: Spacing.lg, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.lg },
  submitButtonDisabled: { backgroundColor: Colors.border },
  submitButtonText: { color: '#FFF', fontSize: FontSizes.lg, ...Fonts.bold },
});
