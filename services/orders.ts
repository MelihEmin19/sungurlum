import { collection, query, where, getDocs, doc, addDoc, serverTimestamp, orderBy, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'market_products';

export interface MarketProduct {
  id?: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  inStock: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selectedOptions?: any[]; // Array of SelectedOption
}

export interface Order {
  id?: string;
  userId: string;
  userName: string;
  phone: string;
  address: string;
  type: 'market' | 'custom' | 'restaurant';
  businessId?: string;
  items?: OrderItem[];
  customNote?: string;
  totalAmount: number;
  deliveryFee: number;
  paymentMethod: 'cash' | 'credit_card_online';
  status: 'pending' | 'preparing' | 'on_way' | 'delivered' | 'cancelled';
  createdAt: any;
}

export const getMarketProducts = async () => {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('inStock', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MarketProduct[];
  } catch (error) {
    console.error('Error fetching market products:', error);
    throw error;
  }
};

export const createOrder = async (orderData: Omit<Order, 'createdAt' | 'id'>) => {
  try {
    const orderRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...orderData,
      createdAt: serverTimestamp()
    });
    return orderRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getUserOrders = async (userId: string) => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
    
    return results.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, { status });
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const getBusinessOrders = async (businessId: string) => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('businessId', '==', businessId)
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
    
    return results.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error fetching business orders:', error);
    throw error;
  }
};
