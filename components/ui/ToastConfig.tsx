import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ToastConfig } from 'react-native-toast-message';
import { Icon } from './Icon';
import { Colors, Fonts, BorderRadius } from '@/constants/theme';
import { BlurView } from 'expo-blur';

const BaseToast = ({ text1, text2, type, iconName, iconColor }: any) => (
  <View style={styles.container}>
    <BlurView intensity={80} tint="light" style={styles.blurContainer}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
          <Icon name={iconName} size={20} color={iconColor} />
        </View>
        <View style={styles.textContainer}>
          {text1 && <Text style={styles.title}>{text1}</Text>}
          {text2 && <Text style={styles.message}>{text2}</Text>}
        </View>
      </View>
    </BlurView>
  </View>
);

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast {...props} iconName="checkCircle" iconColor={Colors.success} />
  ),
  error: (props) => (
    <BaseToast {...props} iconName="alertCircle" iconColor={Colors.error} />
  ),
  info: (props) => (
    <BaseToast {...props} iconName="info" iconColor={Colors.primary} />
  ),
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    marginHorizontal: '5%',
    marginTop: 10,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  blurContainer: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...Fonts.bold,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 2,
  },
  message: {
    ...Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
