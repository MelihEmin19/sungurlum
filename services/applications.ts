import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'applications';

export interface BusinessApplication {
  userId: string;
  name: string;
  fullName?: string;
  businessType?: string;
  minOrderAmount?: string;
  deliveryTime?: string;
  description: string;
  category: string;
  phone: string;
  whatsapp?: string;
  address: string;
  selectedPackage: string;
}

export const submitApplication = async (application: BusinessApplication): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...application,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'manual',
      createdAt: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error submitting application:', error);
    throw error;
  }
};

export const getUserApplicationStatus = async (userId: string) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('userId', '==', userId),
      // Ideally we would order by createdAt desc, but that requires a composite index
      // Since a user typically has only 1 application, we'll just fetch them all and sort in JS
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;

    const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    // Sort by createdAt descending locally to avoid index requirement
    apps.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });

    return apps[0].status; // 'pending', 'approved', 'rejected'
  } catch (error) {
    console.error('Error getting app status', error);
    return null;
  }
};
