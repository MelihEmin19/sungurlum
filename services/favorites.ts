import { collection, query, where, getDocs, doc, setDoc, deleteDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'favorites';

export interface FavoriteItem {
  id?: string;
  userId: string;
  targetId: string; // The ID of the business or classified ad
  targetType: 'business' | 'classified';
  createdAt: any;
}

export const toggleFavorite = async (userId: string, targetId: string, targetType: 'business' | 'classified'): Promise<boolean> => {
  try {
    // Check if it already exists
    const favoriteId = `${userId}_${targetId}`;
    const favoriteRef = doc(db, COLLECTION_NAME, favoriteId);
    const favoriteSnap = await getDoc(favoriteRef);

    if (favoriteSnap.exists()) {
      // It exists, so remove it
      await deleteDoc(favoriteRef);
      return false; // Returns false meaning "it is no longer favorited"
    } else {
      // It doesn't exist, so add it
      await setDoc(favoriteRef, {
        userId,
        targetId,
        targetType,
        createdAt: serverTimestamp()
      });
      return true; // Returns true meaning "it is now favorited"
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

export const checkIfFavorited = async (userId: string, targetId: string): Promise<boolean> => {
  try {
    const favoriteId = `${userId}_${targetId}`;
    const favoriteRef = doc(db, COLLECTION_NAME, favoriteId);
    const favoriteSnap = await getDoc(favoriteRef);
    return favoriteSnap.exists();
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

export const getMyFavorites = async (userId: string, targetType?: 'business' | 'classified') => {
  try {
    let q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    
    if (targetType) {
      q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('targetType', '==', targetType)
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FavoriteItem[];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};

export const getFavoriteCountForTarget = async (targetId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('targetId', '==', targetId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error fetching favorite count:', error);
    return 0;
  }
};
