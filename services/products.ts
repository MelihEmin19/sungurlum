import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'products';

export interface ProductOptionChoice {
  name: string;
  priceOffset: number;
}

export interface ProductOption {
  title: string;
  isRequired: boolean;
  allowMultiple: boolean;
  choices: ProductOptionChoice[];
}

export interface Product {
  id?: string;
  type: 'market' | 'restaurant';
  businessId: string; // 'admin' for market, or business doc ID
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  options?: ProductOption[];
  createdAt?: any;
}

export const getProducts = async (type: 'market' | 'restaurant', businessId: string) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('type', '==', type),
      where('businessId', '==', businessId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...product,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, id), data);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};
