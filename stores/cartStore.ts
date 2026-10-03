import { create } from 'zustand';

export interface SelectedOption {
  optionTitle: string;
  choiceName: string;
  priceOffset: number;
}

export interface CartItem {
  cartItemId: string; // Unique ID in cart
  id: string; // Product ID
  name: string;
  price: number;
  basePrice: number;
  image?: string;
  quantity: number;
  selectedOptions?: SelectedOption[];
}

interface CartState {
  businessId: string | null;
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity' | 'cartItemId'>, businessId: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  canAddToCart: (businessId: string) => boolean;
}

export const useCartStore = create<CartState>((set, get) => ({
  businessId: null,
  items: [],
  
  canAddToCart: (businessId) => {
    const state = get();
    if (state.items.length === 0) return true;
    return state.businessId === businessId;
  },
  
  addToCart: (item, businessId) => {
    set((state) => {
      let currentItems = state.items;
      if (state.businessId && state.businessId !== businessId) {
        currentItems = [];
      }
      
      const cartItemId = item.id + '-' + JSON.stringify(item.selectedOptions || []);
      
      const existingItem = currentItems.find(i => i.cartItemId === cartItemId);
      if (existingItem) {
        return {
          businessId,
          items: currentItems.map(i => 
            i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
          )
        };
      }
      return { businessId, items: [...currentItems, { ...item, cartItemId, quantity: 1 }] };
    });
  },
  
  removeFromCart: (cartItemId) => {
    set((state) => {
      const newItems = state.items.filter(i => i.cartItemId !== cartItemId);
      return {
        items: newItems,
        businessId: newItems.length === 0 ? null : state.businessId
      };
    });
  },
  
  updateQuantity: (cartItemId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        const newItems = state.items.filter(i => i.cartItemId !== cartItemId);
        return { 
          items: newItems,
          businessId: newItems.length === 0 ? null : state.businessId
        };
      }
      return {
        items: state.items.map(i => 
          i.cartItemId === cartItemId ? { ...i, quantity } : i
        )
      };
    });
  },
  
  clearCart: () => set({ items: [], businessId: null }),
  setItems: (items) => set({ items }),
  
  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
  
  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  }
}));
