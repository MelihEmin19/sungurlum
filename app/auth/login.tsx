import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius } from '@/constants/theme';
import SpringButton from '@/components/ui/SpringButton';
import { useAuthStore } from '@/stores/authStore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signInWithGoogle } from '@/utils/auth';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { setUser, setLoading, isLoading } = useAuthStore();

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Lütfen e-posta ve şifrenizi girin.' });
      return;
    }
    
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || userData.displayName,
        phone: userData.phone,
        role: userData.role || 'user',
        addresses: userData.addresses || [],
      });
      Toast.show({ type: 'success', text1: 'Hoş Geldiniz', text2: 'Başarıyla giriş yapıldı.' });
      router.replace('/(tabs)/profile');
    } catch (err: any) {
      console.error(err);
      Toast.show({ type: 'error', text1: 'Hata', text2: 'E-posta veya şifre hatalı.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const result = await signInWithGoogle();
    setLoading(false);
    if (result.success) {
      Toast.show({ type: 'success', text1: 'Hoş Geldiniz', text2: 'Google ile giriş yapıldı.' });
      router.replace('/(tabs)/profile');
    } else {
      Toast.show({ type: 'error', text1: 'Google Girişi Başarısız', text2: result.error });
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <SpringButton 
          style={styles.backButton}
          onPress={() => router.back()}
          scaleTo={0.9}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </SpringButton>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Hoş{'\n'}Geldiniz.</Text>
        <Text style={styles.subtitle}>Devam etmek için giriş yapın</Text>

        <View style={styles.form}>
          
          <SpringButton 
            style={styles.googleButton}
            scaleTo={0.97}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <MaterialCommunityIcons name="google" size={20} color={Colors.text} />
            <Text style={styles.googleButtonText}>Google ile Giriş Yap</Text>
          </SpringButton>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>VEYA</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-Posta Adresi</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="email-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ornek@mail.com"
                placeholderTextColor={Colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <View style={styles.passwordHeader}>
              <Text style={styles.label}>Şifre</Text>
            </View>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            
            <SpringButton 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleEmailLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.loginButtonText}>Giriş Yap</Text>
              )}
            </SpringButton>
          </View>

        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Hesabınız yok mu? </Text>
        <SpringButton scaleTo={0.95} onPress={() => router.push('/auth/register')}>
          <Text style={styles.footerLink}>Kayıt Ol</Text>
        </SpringButton>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.hero,
    ...Fonts.extraBold,
    color: Colors.text,
    lineHeight: 48,
    letterSpacing: -1,
    marginTop: Spacing.lg,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    ...Fonts.medium,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.md,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: FontSizes.sm,
    ...Fonts.bold,
    color: Colors.text,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.lg,
    height: 56,
    paddingHorizontal: Spacing.lg,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
    ...Fonts.medium,
    ...Platform.select({
      web: { outlineStyle: 'none' as any },
    }),
  },
  loginButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    ...Fonts.bold,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    ...Fonts.bold,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    height: 56,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
  },
  googleButtonText: {
    fontSize: FontSizes.md,
    ...Fonts.bold,
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  footerText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    ...Fonts.medium,
  },
  footerLink: {
    fontSize: FontSizes.sm,
    ...Fonts.bold,
    color: Colors.primary,
  },
});
