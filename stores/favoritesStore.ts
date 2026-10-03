import { create } from 'zustand';

interface FavoritesState {
  favorites: string[]; // List of business IDs
  toggleFavorite: (businessId: string) => void;
  isFavorite: (businessId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  
  toggleFavorite: (businessId) => set((state) => {
    const isFav = state.favorites.includes(businessId);
    if (isFav) {
      return { favorites: state.favorites.filter(id => id !== businessId) };
    } else {
      return { favorites: [...state.favorites, businessId] };
    }
  }),
  
  isFavorite: (businessId) => {
    return get().favorites.includes(businessId);
  }
}));
