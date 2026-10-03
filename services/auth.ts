import { auth, db } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../stores/authStore';

export const loginWithEmail = async (email: string, password: string): Promise<any> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Fetch additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};

    const user = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName || userData.displayName || email.split('@')[0],
      phone: userData.phone || '',
      role: (userData.role as any) || 'user',
    };
    
    // Update store
    useAuthStore.getState().setUser(user);
    
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, password: string, name: string, phone: string = ''): Promise<any> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile
    await updateProfile(userCredential.user, { displayName: name });
    
    // Send email verification
    await sendEmailVerification(userCredential.user);

    // Save to Firestore users collection
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      displayName: name,
      phone,
      role: 'user',
      createdAt: new Date().toISOString()
    });

    const user = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: name,
      phone,
      role: 'user' as any,
    };
    
    // Update store
    useAuthStore.getState().setUser(user);

    return user;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    useAuthStore.getState().logout();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};
