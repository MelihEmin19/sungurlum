import { collection, addDoc, getDocs, doc, getDoc, serverTimestamp, query, orderBy, limit, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'classifieds';

export interface ClassifiedAd {
  userId: string;
  userName: string;
  title: string;
  description: string;
  price: string;
  category: string;
  images: string[];
  sellerPhone: string;
}

export const createClassifiedAd = async (adData: ClassifiedAd): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...adData,
      status: 'pending', // Pending admin approval
      views: 0,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating classified ad:', error);
    throw error;
  }
};

export const getApprovedClassifieds = async (categoryFilter?: string) => {
  try {
    let q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', 'approved')
    );

    if (categoryFilter && categoryFilter !== 'all') {
      q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'approved'),
        where('category', '==', categoryFilter)
      );
    }

    const querySnapshot = await getDocs(q);
    
    // Filter out ads older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const validAds = [];
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      let createdAtDate;
      
      if (data.createdAt?.toDate) {
        createdAtDate = data.createdAt.toDate();
      } else if (data.createdAt) {
        createdAtDate = new Date(data.createdAt);
      } else {
        createdAtDate = new Date(); // Fallback if no date
      }
      
      if (createdAtDate > thirtyDaysAgo) {
        validAds.push({ id: doc.id, ...data } as (ClassifiedAd & { id: string, status: string }));
      }
    }
    
    // Sort locally by createdAt desc
    validAds.sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    
    return validAds.slice(0, 50);
  } catch (error) {
    console.error('Error fetching classifieds:', error);
    throw error;
  }
};

export const getClassifiedById = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ClassifiedAd & { id: string, status: string };
    }
    return null;
  } catch (error) {
    console.error('Error fetching classified ad:', error);
    throw error;
  }
};

export const getMyClassifieds = async (userId: string) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (ClassifiedAd & { id: string, status: string })[];

    return results.sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error fetching my classifieds:', error);
    throw error;
  }
};

export const updateClassified = async (id: string, updates: Partial<ClassifiedAd>) => {
  try {
    // Add logic here to possibly set status back to 'pending' if major changes (like title) are made.
    // For now, just update.
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      ...updates
    });
    return true;
  } catch (error) {
    console.error('Error updating classified ad:', error);
    throw error;
  }
};

export const deleteClassified = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return true;
  } catch (error) {
    console.error('Error deleting classified ad:', error);
    throw error;
  }
};


