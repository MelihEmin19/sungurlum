import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, db } from '@/config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  GoogleSignin.configure({
    webClientId: '612964851455-lsi2scd7nqarg34770gs9rf34p15rqr7.apps.googleusercontent.com', // Replace with the real web client ID from Firebase Console
  });
} catch (error) {
  console.warn("GoogleSignin native module not found, likely running in Expo Go.");
}

export const signInWithGoogle = async () => {
  try {
    if (!GoogleSignin) {
      throw new Error("Google ile giriş şu an test ortamında (Expo Go) desteklenmiyor. Uygulama yayınlandığında aktif olacaktır.");
    }

    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();
    
    if (!idToken) {
      throw new Error('No ID token found');
    }

    // Create a Google credential with the token
    const googleCredential = GoogleAuthProvider.credential(idToken);
    
    // Sign-in the user with the credential
    const userCredential = await signInWithCredential(auth, googleCredential);
    const user = userCredential.user;

    // Check if user exists in Firestore, if not create them
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        displayName: user.displayName || 'Yeni Kullanıcı',
        email: user.email,
        role: 'user',
        addresses: [],
        createdAt: serverTimestamp(),
        // Note: phone is intentionally left blank to be asked at checkout
      });
    }
    
    return { success: true, user };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    return { success: false, error: error.message };
  }
};
