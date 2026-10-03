import { collection, query, where, getDocs, doc, addDoc, serverTimestamp, orderBy, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'reviews';

export interface Review {
  id?: string;
  businessId: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: any;
  status?: 'pending' | 'approved' | 'rejected';
}

export const submitReview = async (reviewData: Omit<Review, 'createdAt' | 'id'>) => {
  try {
    // 1. Add the review
    const reviewRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...reviewData,
      createdAt: serverTimestamp()
    });

    // 2. Update the business's average rating and review count
    const businessRef = doc(db, 'businesses', reviewData.businessId);
    const businessSnap = await getDoc(businessRef);
    
    if (businessSnap.exists()) {
      const businessData = businessSnap.data();
      const currentCount = businessData.reviewCount || 0;
      const currentRating = businessData.rating || 0;

      const newCount = currentCount + 1;
      const newRating = ((currentRating * currentCount) + reviewData.rating) / newCount;

      await updateDoc(businessRef, {
        rating: newRating,
        reviewCount: newCount
      });
    }

    return reviewRef.id;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

export const getBusinessReviews = async (businessId: string) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('businessId', '==', businessId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

export const getUserReviews = async (userId: string) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
    
    // Sort locally to avoid Firebase composite index requirement
    return results.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};

export const getAllReviews = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId: string, businessId: string, rating: number) => {
  try {
    const { deleteDoc } = require('firebase/firestore');
    
    // First, delete the review
    await deleteDoc(doc(db, COLLECTION_NAME, reviewId));
    
    // Then, update the business rating
    const businessRef = doc(db, 'businesses', businessId);
    const businessSnap = await getDoc(businessRef);
    
    if (businessSnap.exists()) {
      const businessData = businessSnap.data();
      const currentCount = businessData.reviewCount || 1;
      const currentRating = businessData.rating || 0;
      
      const newCount = Math.max(0, currentCount - 1);
      
      // Calculate new average rating safely
      let newRating = 0;
      if (newCount > 0) {
        // (totalSum - thisRating) / newCount
        const totalSum = currentRating * currentCount;
        newRating = (totalSum - rating) / newCount;
      }
      
      await updateDoc(businessRef, {
        rating: newRating,
        reviewCount: newCount
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};
