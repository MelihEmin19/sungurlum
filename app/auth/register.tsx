import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius } from '@/constants/theme';
import SpringButton from '@/components/ui/SpringButton';
import { useAuthStore } from '@/stores/authStore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import Toast from 'react-native-toast-message';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [isKvkkAgreed, setIsKvkkAgreed] = useState(false);
  
  const { setUser, setLoading, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Toast.show({ type: 'error', text1: 'Eksik Bilgi', text2: 'Lütfen tüm alanları doldurun.' });
      return;
    }

    if (!isTermsAgreed || !isKvkkAgreed) {
      Toast.show({ type: 'error', text1: 'Eksik Onay', text2: 'Lütfen KVKK Aydınlatma Metni ve Satış Sözleşmesini onaylayın.' });
      return;
    }
    
    setLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with name
      await updateProfile(user, { displayName: name });
      
      // Create user doc
      await setDoc(doc(db, 'users', user.uid), {
        displayName: name,
        email: user.email,
        role: 'user',
        addresses: [],
        createdAt: serverTimestamp()
      });
      
      setUser({
        uid: user.uid,
        email: user.email,
        displayName: name,
        role: 'user',
        addresses: [],
      });
      
      Toast.show({ type: 'success', text1: 'Kayıt Başarılı! 🎉', text2: 'Hesabınız başarıyla oluşturuldu.' });
      router.replace('/(tabs)/profile');
    } catch (err: any) {
      console.error(err);
      let errorMsg = 'Kayıt başarısız oldu.';
      if (err.code === 'auth/email-already-in-use') errorMsg = 'Bu e-posta adresi zaten kullanımda.';
      if (err.code === 'auth/weak-password') errorMsg = 'Şifre en az 6 karakter olmalıdır.';
      
      Toast.show({ type: 'error', text1: 'Hata', text2: errorMsg });
    } finally {
      setLoading(false);
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Yeni{'\n'}Hesap.</Text>
        <Text style={styles.subtitle}>Topluluğumuza katılmak için kayıt olun</Text>

        <View style={styles.form}>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ad Soyad</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="account-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Örn: Ahmet Yılmaz"
                placeholderTextColor={Colors.textTertiary}
                value={name}
                onChangeText={setName}
              />
            </View>
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
            <Text style={styles.label}>Şifre</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="En az 6 karakter"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.checkboxContainer} 
            activeOpacity={0.7} 
            onPress={() => setIsTermsAgreed(!isTermsAgreed)}
          >
            <View style={[styles.checkbox, isTermsAgreed && styles.checkboxChecked]}>
              {isTermsAgreed && <MaterialCommunityIcons name="check" size={16} color="#FFF" />}
            </View>
            <Text style={styles.checkboxText}>
              <Text 
                style={styles.linkText} 
                onPress={() => Toast.show({ type: 'info', text1: 'Sözleşme', text2: 'Mesafeli Satış Sözleşmesi web sitemizdedir.' })}
              >Kullanım Koşulları ve Mesafeli Satış Sözleşmesi</Text>'ni okudum, kabul ediyorum.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.checkboxContainer, { marginTop: Spacing.xs }]} 
            activeOpacity={0.7} 
            onPress={() => setIsKvkkAgreed(!isKvkkAgreed)}
          >
            <View style={[styles.checkbox, isKvkkAgreed && styles.checkboxChecked]}>
              {isKvkkAgreed && <MaterialCommunityIcons name="check" size={16} color="#FFF" />}
            </View>
            <Text style={styles.checkboxText}>
              <Text 
                style={styles.linkText} 
                onPress={() => Toast.show({ type: 'info', text1: 'Aydınlatma Metni', text2: 'KVKK Aydınlatma Metni web sitemizdedir.' })}
              >KVKK Aydınlatma Metni</Text>'ni okudum, anladım.
            </Text>
          </TouchableOpacity>

          <SpringButton 
            style={[styles.registerButton, (!isTermsAgreed || !isKvkkAgreed || isLoading) && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={!isTermsAgreed || !isKvkkAgreed || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.registerButtonText}>Kayıt Ol</Text>
            )}
          </SpringButton>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabınız var mı? </Text>
          <SpringButton scaleTo={0.95} onPress={() => router.push('/auth/login')}>
            <Text style={styles.footerLink}>Giriş Yap</Text>
          </SpringButton>
        </View>
      </ScrollView>
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
    paddingBottom: Spacing.sm,
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
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  title: {
    fontSize: FontSizes.hero,
    ...Fonts.extraBold,
    color: Colors.text,
    lineHeight: 48,
    letterSpacing: -1,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    ...Fonts.medium,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.sm,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
    paddingRight: Spacing.xl,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    ...Fonts.medium,
    lineHeight: 20,
  },
  linkText: {
    color: Colors.primary,
    ...Fonts.bold,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  registerButtonDisabled: {
    opacity: 0.5,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    ...Fonts.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xxl,
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
