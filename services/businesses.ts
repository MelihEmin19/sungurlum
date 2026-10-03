import { collection, getDocs, getDoc, doc, setDoc, query, orderBy, where, limit, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MOCK_BUSINESSES, Business } from '../constants/mockData';

const COLLECTION_NAME = 'businesses';

// Helper to generate keywords for search
export const generateKeywords = (text: string): string[] => {
  if (!text) return [];
  const words = text.toLowerCase().trim().split(/\s+/);
  const keywords: string[] = [];
  words.forEach(word => {
    let current = '';
    for (let i = 0; i < word.length; i++) {
      current += word[i];
      keywords.push(current);
    }
  });
  return Array.from(new Set(keywords));
};

export const getBusinesses = async (lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null = null, limitCount = 15): Promise<{ businesses: Business[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
  try {
    let q = query(
      collection(db, COLLECTION_NAME), 
      where('status', '==', 'approved'),
      limit(limitCount)
    );

    if (lastVisibleDoc) {
      q = query(
        collection(db, COLLECTION_NAME), 
        where('status', '==', 'approved'),
        startAfter(lastVisibleDoc),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    
    const businesses: Business[] = [];
    snapshot.forEach((doc) => {
      businesses.push({ id: doc.id, ...doc.data() } as Business);
    });
    
    const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
    
    return { businesses, lastVisible };
  } catch (error) {
    console.log('Error fetching businesses from Firebase:', error);
    return { businesses: [], lastVisible: null };
  }
};

export const getBusinessById = async (id: string): Promise<Business | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Business;
    }
    return null;
  } catch (error) {
    console.log('Error fetching business by id:', error);
    return null;
  }
};

export const searchBusinesses = async (searchQuery: string): Promise<Business[]> => {
  try {
    if (!searchQuery) return [];
    
    const lowerQuery = searchQuery.toLowerCase().trim();
    
    // We use array-contains on keywords array
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', 'approved'),
      where('keywords', 'array-contains', lowerQuery),
      limit(20)
    );
    
    const snapshot = await getDocs(q);
    const businesses: Business[] = [];
    
    snapshot.forEach((doc) => {
      businesses.push({ id: doc.id, ...doc.data() } as Business);
    });
    
    // Fallback logic if keywords are empty (e.g. legacy data)
    if (businesses.length === 0) {
      // Fetch all approved and filter in memory (Fallback)
      const allQ = query(collection(db, COLLECTION_NAME), where('status', '==', 'approved'));
      const allSnap = await getDocs(allQ);
      allSnap.forEach((doc) => {
        const b = { id: doc.id, ...doc.data() } as Business;
        if (
          b.name?.toLowerCase().includes(lowerQuery) || 
          b.description?.toLowerCase().includes(lowerQuery) ||
          b.category?.toLowerCase().includes(lowerQuery)
        ) {
          businesses.push(b);
        }
      });
    }
    
    return businesses;
  } catch (error) {
    console.error('Error searching businesses:', error);
    return [];
  }
};

export const getBusinessesByCategory = async (categorySlug: string): Promise<Business[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('category', '==', categorySlug),
      where('status', '==', 'approved')
    );
    const snapshot = await getDocs(q);
    
    const businesses: Business[] = [];
    snapshot.forEach((doc) => {
      businesses.push({ id: doc.id, ...doc.data() } as Business);
    });
    
    return businesses;
  } catch (error) {
    console.error('Error fetching by category:', error);
    return [];
  }
};

export const seedBusinesses = async (): Promise<void> => {
  try {
    const promises = MOCK_BUSINESSES.map((business) => {
      const businessRef = doc(db, COLLECTION_NAME, business.id);
      return setDoc(businessRef, business);
    });
    
    await Promise.all(promises);
    console.log('Successfully seeded businesses to Firebase!');
  } catch (error) {
    console.error('Error seeding businesses:', error);
    throw error;
  }
};

export const addManualBusiness = async (data: Partial<Business>): Promise<string> => {
  try {
    const docRef = doc(collection(db, COLLECTION_NAME));
    
    const businessData = {
      ...data,
      id: docRef.id,
      rating: 5.0,
      reviewCount: 0,
      images: data.images || [],
      isFeatured: data.isFeatured || false,
      membershipTier: data.membershipTier || 'basic',
      status: 'approved',
      createdAt: new Date().toISOString()
    };
    
    // @ts-ignore - dynamic key
    businessData.keywords = generateKeywords(`${businessData.name} ${businessData.category} ${businessData.description || ''}`);
    
    await setDoc(docRef, businessData);
    console.log('Successfully added manual business with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding manual business:', error);
    throw error;
  }
};
