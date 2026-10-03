import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import SpringButton from '@/components/ui/SpringButton';
import MapView, { Marker, Callout } from 'react-native-maps';
import { getBusinesses } from '@/services/businesses';
import { Business } from '@/constants/mockData';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMapData = async () => {
      try {
        const { businesses: allBusinesses } = await getBusinesses();
        // Sadece onaylı olanları göster
        setBusinesses(allBusinesses.filter(b => b.status === 'approved'));
      } catch (error) {
        Alert.alert('Hata', 'Harita verileri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    
    loadMapData();
  }, []);

  // Sungurlu merkezi koordinatları
  const initialRegion = {
    latitude: 40.1667,
    longitude: 34.3667,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <SpringButton style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </SpringButton>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
        >
          {businesses.map((biz) => {
            // Basit bir mock koordinat sistemi ekleyelim eğer db'de yoksa
            // Normalde db'ye eklenirken kullanıcının konumu alınmalı
            const lat = 40.1667 + (Math.random() - 0.5) * 0.02;
            const lng = 34.3667 + (Math.random() - 0.5) * 0.02;
            
            return (
              <Marker
                key={biz.id}
                coordinate={{ latitude: lat, longitude: lng }}
                title={biz.name}
                description={biz.category}
              />
            );
          })}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    zIndex: 10,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  backButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: Colors.surface, 
    alignItems: 'center', 
    justifyContent: 'center',
    ...Shadows.md 
  },
  map: { width: '100%', height: '100%' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
