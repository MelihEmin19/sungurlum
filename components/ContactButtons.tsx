import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, BorderRadius, Shadows, Spacing, FontSizes, Fonts } from '@/constants/theme';

interface ContactButtonsProps {
  phone: string;
  whatsapp?: string;
  address?: string;
}

export default function ContactButtons({ phone, whatsapp, address }: ContactButtonsProps) {
  const handleCall = () => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = () => {
    if (whatsapp) {
      const url = `whatsapp://send?phone=${whatsapp}`;
      Linking.openURL(url).catch(() => {
        Linking.openURL(`https://wa.me/${whatsapp}`);
      });
    }
  };

  const handleMap = () => {
    if (address) {
      const encodedAddress = encodeURIComponent(address);
      const url = Platform.select({
        ios: `maps:0,0?q=${encodedAddress}`,
        android: `geo:0,0?q=${encodedAddress}`,
        default: `https://maps.google.com/?q=${encodedAddress}`,
      });
      if (url) Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.callButton]}
        onPress={handleCall}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="phone" size={20} color="#FFF" />
        <Text style={styles.buttonText}>Ara</Text>
      </TouchableOpacity>

      {whatsapp ? (
        <TouchableOpacity
          style={[styles.button, styles.whatsappButton]}
          onPress={handleWhatsApp}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="whatsapp" size={20} color="#FFF" />
          <Text style={styles.buttonText}>WhatsApp</Text>
        </TouchableOpacity>
      ) : null}

      {address ? (
        <TouchableOpacity
          style={[styles.button, styles.mapButton]}
          onPress={handleMap}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="map-marker" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Yol Tarifi</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: 6,
    ...Shadows.sm,
  },
  callButton: {
    backgroundColor: Colors.primary,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  mapButton: {
    backgroundColor: Colors.accent,
  },
  buttonText: {
    fontSize: FontSizes.sm,
    ...Fonts.semiBold,
    color: '#FFFFFF',
  },
});
