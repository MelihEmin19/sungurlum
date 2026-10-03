import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MOCK_BUSINESSES } from '@/constants/mockData';
import { Colors, Spacing, Fonts, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import SpringButton from '@/components/ui/SpringButton';
import { getCategoryById } from '@/constants/categories';

const { width, height } = Dimensions.get('window');

// Default coordinates for Sungurlu, Çorum
const INITIAL_REGION = {
  latitude: 40.1667,
  longitude: 34.3667,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);

  const businessesWithLocation = MOCK_BUSINESSES.filter((b) => b.location);

  return (
    <View style={styles.container}>
      {/* Header Overlay */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top + Spacing.sm }]}>
        <SpringButton style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </SpringButton>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} />
          <Text style={styles.searchPlaceholder}>Haritada esnaf ara...</Text>
        </View>
      </View>

      <MapView
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {businessesWithLocation.map((business) => {
          const category = getCategoryById(business.category);
          return (
            <Marker
              key={business.id}
              coordinate={{
                latitude: business.location!.latitude,
                longitude: business.location!.longitude,
              }}
              onPress={() => setSelectedBusiness(business.id)}
            >
              <View style={[styles.markerContainer, { backgroundColor: category?.color || Colors.primary }]}>
                <MaterialCommunityIcons name={(category?.icon as any) || 'store'} size={16} color="#FFF" />
              </View>
              <Callout tooltip onPress={() => router.push(`/business/${business.id}`)}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{business.name}</Text>
                  <Text style={styles.calloutCategory}>{category?.name}</Text>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingText}>{business.rating}</Text>
                    <MaterialCommunityIcons name="star" size={12} color={Colors.star} />
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Locate Me Button Overlay */}
      <SpringButton style={styles.locateButton}>
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color={Colors.text} />
      </SpringButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    width,
    height,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  searchBar: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  searchPlaceholder: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    ...Fonts.medium,
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    ...Shadows.md,
  },
  calloutContainer: {
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    width: 150,
    alignItems: 'center',
    ...Shadows.md,
  },
  calloutTitle: {
    fontSize: FontSizes.sm,
    ...Fonts.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  calloutCategory: {
    fontSize: 10,
    ...Fonts.medium,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    ...Fonts.bold,
    color: Colors.star,
  },
  locateButton: {
    position: 'absolute',
    bottom: Spacing.xxxl,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
});
