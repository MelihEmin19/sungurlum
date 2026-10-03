import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { CATEGORIES, Category } from '../constants/categories';

const COLLECTION_NAME = 'categories';

export const getCategories = async (): Promise<Category[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('No categories found in Firebase. Falling back to local data.');
      return CATEGORIES;
    }
    
    const categories: Category[] = [];
    snapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as Category);
    });
    
    return categories;
  } catch (error: any) {
    console.log('Error fetching categories from Firebase:', error.message);
    console.log('Using local category constants as fallback.');
    return CATEGORIES;
  }
};

export const seedCategories = async (): Promise<void> => {
  try {
    const promises = CATEGORIES.map((category) => {
      const categoryRef = doc(db, COLLECTION_NAME, category.id);
      return setDoc(categoryRef, category);
    });
    
    await Promise.all(promises);
    console.log('Successfully seeded categories to Firebase!');
  } catch (error: any) {
    console.error('Error seeding categories:', error);
    throw error;
  }
};

export const addCategory = async (category: Category) => {
  try {
    const categoryRef = doc(db, COLLECTION_NAME, category.id);
    await setDoc(categoryRef, category);
    return true;
  } catch (error: any) {
    console.error('Error adding category:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, data: Partial<Category>) => {
  try {
    const { updateDoc } = require('firebase/firestore');
    const categoryRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(categoryRef, data);
    return true;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string) => {
  try {
    const { deleteDoc } = require('firebase/firestore');
    const categoryRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(categoryRef);
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};
