import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, Fonts, Shadows, BorderRadius } from '@/constants/theme';
import { EMERGENCY_NUMBERS } from '@/constants/emergencyNumbers';

export default function EmergencyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <MaterialCommunityIcons name="alarm-light" size={22} color={Colors.error} />
        <Text style={styles.headerTitle}>Acil Numaralar</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <MaterialCommunityIcons name="alert-circle" size={20} color={Colors.error} />
          <Text style={styles.warningText}>
            Acil durumlarda lütfen hemen 112'yi arayın
          </Text>
        </View>

        {EMERGENCY_NUMBERS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.emergencyCard}
            onPress={() => handleCall(item.phone)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
              <MaterialCommunityIcons
                name={item.icon as any}
                size={28}
                color={item.color}
              />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </View>
            <View style={styles.phoneContainer}>
              <Text style={[styles.phoneNumber, { color: item.color }]}>{item.phone}</Text>
              <View style={[styles.callIcon, { backgroundColor: item.color }]}>
                <MaterialCommunityIcons name="phone" size={16} color="#FFF" />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    ...Fonts.bold,
    color: Colors.text,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  warningText: {
    fontSize: FontSizes.sm,
    ...Fonts.semiBold,
    color: Colors.error,
    flex: 1,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FontSizes.md,
    ...Fonts.semiBold,
    color: Colors.text,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
  },
  phoneContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },
  phoneNumber: {
    fontSize: FontSizes.lg,
    ...Fonts.extraBold,
  },
  callIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacer: {
    height: 32,
  },
});
