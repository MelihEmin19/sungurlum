import { create } from 'zustand';

export interface SavedAddress {
  id: string;
  title: string; // e.g. "Ev", "İş"
  address: string;
}

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  phone?: string;
  role?: 'user' | 'business' | 'admin';
  addresses?: SavedAddress[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
