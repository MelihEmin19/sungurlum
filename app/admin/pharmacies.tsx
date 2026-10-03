import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius, Shadows } from '@/constants/theme';
import SpringButton from '@/components/ui/SpringButton';
import { getPharmaciesForMonth, savePharmacySchedule, deletePharmacySchedule, DutyPharmacy } from '@/services/pharmacies';

export default function AdminPharmaciesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter(); // if using expo-router this is standard
  
  const [loading, setLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState<DutyPharmacy[]>([]);
  
  // Form states
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    fetchPharmacies();
  }, [currentYear, currentMonth]);

  const fetchPharmacies = async () => {
    setLoading(true);
    try {
      const data = await getPharmaciesForMonth(currentYear, currentMonth);
      // Sort by date ascending
      data.sort((a, b) => a.date.localeCompare(b.date));
      setPharmacies(data);
    } catch (error) {
      Alert.alert('Hata', 'Veriler çekilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!dateStr || !name || !address || !phone) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    // Format validation YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) {
      Alert.alert('Hata', 'Tarih formatı YYYY-MM-DD olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      await savePharmacySchedule({
        date: dateStr,
        name,
        address,
        phone
      });
      Alert.alert('Başarılı', 'Nöbetçi eczane eklendi.');
      setName('');
      setAddress('');
      setPhone('');
      fetchPharmacies();
    } catch (error) {
      Alert.alert('Hata', 'Eklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Onay', 'Bu nöbetçi eczaneyi silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { 
        text: 'Sil', 
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await deletePharmacySchedule(id);
            fetchPharmacies();
          } catch (error) {
            Alert.alert('Hata', 'Silinirken bir sorun oluştu.');
            setLoading(false);
          }
        }
      }
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nöbetçi Eczaneler</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Yeni Ekle</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tarih (YYYY-AA-GG)</Text>
            <TextInput style={styles.input} value={dateStr} onChangeText={setDateStr} placeholder="2026-07-02" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Eczane Adı</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Örn: Merkez Eczanesi" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adres</Text>
            <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Örn: Fatih Mah. vs." />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefon</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Örn: 0364 311 11 11" keyboardType="phone-pad" />
          </View>

          <SpringButton style={styles.addButton} onPress={handleAdd} disabled={loading}>
            <Text style={styles.addButtonText}>Ekle</Text>
          </SpringButton>
        </View>

        <View style={styles.monthSelector}>
          <SpringButton onPress={() => {
            let m = currentMonth - 1;
            let y = currentYear;
            if (m < 1) { m = 12; y--; }
            setCurrentMonth(m); setCurrentYear(y);
          }}>
            <MaterialCommunityIcons name="chevron-left" size={24} color={Colors.text} />
          </SpringButton>
          <Text style={styles.monthText}>{currentYear} - {currentMonth.toString().padStart(2, '0')}</Text>
          <SpringButton onPress={() => {
            let m = currentMonth + 1;
            let y = currentYear;
            if (m > 12) { m = 1; y++; }
            setCurrentMonth(m); setCurrentYear(y);
          }}>
            <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.text} />
          </SpringButton>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
        ) : (
          pharmacies.map(pharm => (
            <View key={pharm.id} style={styles.listItem}>
              <View style={styles.listInfo}>
                <Text style={styles.listDate}>{pharm.date}</Text>
                <Text style={styles.listName}>{pharm.name}</Text>
              </View>
              <SpringButton style={styles.deleteBtn} onPress={() => pharm.id && handleDelete(pharm.id)}>
                <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.error} />
              </SpringButton>
            </View>
          ))
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md, paddingTop: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, backgroundColor: Colors.surface, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: FontSizes.xl, ...Fonts.extraBold, color: Colors.text },
  content: { padding: Spacing.xl },
  formCard: { backgroundColor: Colors.surface, padding: Spacing.lg, borderRadius: BorderRadius.xl, marginBottom: Spacing.xxl, borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.sm },
  sectionTitle: { fontSize: FontSizes.lg, ...Fonts.bold, color: Colors.text, marginBottom: Spacing.md },
  inputGroup: { marginBottom: Spacing.md },
  label: { fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.textSecondary, marginBottom: 4 },
  input: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.borderLight, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, height: 48, ...Fonts.medium },
  addButton: { backgroundColor: Colors.primary, height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm },
  addButtonText: { color: '#FFF', fontSize: FontSizes.md, ...Fonts.bold },
  monthSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg, backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.borderLight },
  monthText: { fontSize: FontSizes.md, ...Fonts.bold, color: Colors.text },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.borderLight },
  listInfo: { flex: 1 },
  listDate: { fontSize: FontSizes.xs, color: Colors.textSecondary, ...Fonts.bold },
  listName: { fontSize: FontSizes.md, color: Colors.text, ...Fonts.medium },
  deleteBtn: { padding: Spacing.sm },
});
