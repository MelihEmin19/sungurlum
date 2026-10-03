import { create } from 'zustand';
import { Business } from '../constants/mockData';
import { searchBusinesses } from '../services/businesses';

interface SearchState {
  query: string;
  results: Business[];
  isSearching: boolean;
  setQuery: (query: string) => void;
  performSearch: () => Promise<void>;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  isSearching: false,
  
  setQuery: (query) => set({ query }),
  
  performSearch: async () => {
    const { query } = get();
    if (!query.trim()) {
      set({ results: [], isSearching: false });
      return;
    }
    
    set({ isSearching: true });
    try {
      const results = await searchBusinesses(query);
      set({ results, isSearching: false });
    } catch (error) {
      console.error('Search failed', error);
      set({ results: [], isSearching: false });
    }
  },
  
  clearSearch: () => set({ query: '', results: [], isSearching: false }),
}));
