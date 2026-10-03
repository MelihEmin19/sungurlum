import '../global.css';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { 
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold 
} from '@expo-google-fonts/plus-jakarta-sans';
import 'react-native-reanimated';
import { toastConfig } from '@/components/ui/ToastConfig';
import { Colors } from '@/constants/theme';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthStore } from '@/stores/authStore';
import { registerForPushNotificationsAsync, savePushTokenToUser } from '@/services/notifications';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { Alert } from 'react-native';
import { useAlertStore } from '@/stores/alertStore';
import { PremiumAlert } from '@/components/ui/PremiumAlert';

// Override React Native's default Alert
const originalAlert = Alert.alert;
Alert.alert = (title, message, buttons) => {
  useAlertStore.getState().showAlert(title, message, buttons);
};

try {
  configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
  });
} catch (e) {}

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || userData.displayName || null,
            phone: userData.phone,
            role: userData.role || 'user',
            addresses: userData.addresses || [],
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
            setUser({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              role: 'user', // Fallback role
              addresses: [],
            });
          }
          
          // Push notifications
          try {
            const pushToken = await registerForPushNotificationsAsync();
            if (pushToken) {
              await savePushTokenToUser(user.uid, pushToken);
            }
          } catch (e) {
            console.log('Push error', e);
          }

        } else {
          setUser(null);
        }
      setLoading(false);
      if (fontsLoaded) {
        SplashScreen.hideAsync();
      }
    });

    return unsubscribe;
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F8F9FA' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="business/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="category/[slug]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="search/[query]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="emergency"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="apply/business"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="classifieds"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="market"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </Stack>
      <PremiumAlert />
      <Toast config={toastConfig} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});
