import { create } from 'zustand';

interface Notification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  type: 'campaign' | 'system' | 'delivery';
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [
    {
      id: '1',
      title: 'Hoş Geldiniz!',
      body: 'Sungurlum rehberine hoş geldiniz. Bölgenizdeki en iyi esnafları keşfetmeye hemen başlayın.',
      isRead: false,
      createdAt: new Date().toISOString(),
      type: 'system',
    }
  ],
  
  get unreadCount() {
    return get().notifications.filter(n => !n.isRead).length;
  },
  
  addNotification: (notif) => set((state) => {
    const newNotification: Notification = {
      ...notif,
      id: Math.random().toString(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    return { notifications: [newNotification, ...state.notifications] };
  }),
  
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    )
  })),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true }))
  })),
  
  clearAll: () => set({ notifications: [] }),
}));
