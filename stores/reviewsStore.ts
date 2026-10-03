import { create } from 'zustand';
import { MOCK_REVIEWS } from '../constants/mockData';
import { Review } from '../services/reviews';

interface ReviewsState {
  reviews: Review[];
  addReview: (review: Review) => void;
  getReviewsByBusiness: (businessId: string) => Review[];
}

export const useReviewsStore = create<ReviewsState>((set, get) => ({
  // Initialize with mock data
  reviews: [...MOCK_REVIEWS],
  
  addReview: (newReview) => set((state) => ({ 
    reviews: [newReview, ...state.reviews] 
  })),
  
  getReviewsByBusiness: (businessId) => {
    return get().reviews.filter(
      (r) => r.businessId === businessId && r.status === 'approved'
    );
  }
}));
