import { collection, doc, getDocs, setDoc, deleteDoc, query, where, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface DutyPharmacy {
  id?: string;
  name: string;
  address: string;
  phone: string;
  date: string; // Format: YYYY-MM-DD
}

const COLLECTION_NAME = 'duty_pharmacies';

export const getPharmaciesForToday = async (): Promise<DutyPharmacy[]> => {
  const today = new Date();
  // Format local date correctly as YYYY-MM-DD
  const offset = today.getTimezoneOffset();
  const todayStr = new Date(today.getTime() - (offset*60*1000)).toISOString().split('T')[0];

  const q = query(collection(db, COLLECTION_NAME), where('date', '==', todayStr));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DutyPharmacy));
};

export const getPharmaciesForMonth = async (year: number, month: number): Promise<DutyPharmacy[]> => {
  // month is 1-indexed (1-12)
  const monthStr = month.toString().padStart(2, '0');
  const prefix = `${year}-${monthStr}-`;
  
  // Get all pharmacies. Since we don't have a "startsWith" in Firestore easily without range queries,
  // we'll fetch where date >= prefix and date < prefix + \uf8ff
  const q = query(
    collection(db, COLLECTION_NAME), 
    where('date', '>=', prefix),
    where('date', '<=', prefix + '\uf8ff')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DutyPharmacy));
};

export const savePharmacySchedule = async (pharmacy: Omit<DutyPharmacy, 'id'>) => {
  const newDocRef = doc(collection(db, COLLECTION_NAME));
  await setDoc(newDocRef, pharmacy);
  return { id: newDocRef.id, ...pharmacy };
};

export const deletePharmacySchedule = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};

export const checkNextMonthScheduleExists = async (): Promise<boolean> => {
  const now = new Date();
  
  // Check next month
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextYear = nextMonthDate.getFullYear();
  const nextMonth = nextMonthDate.getMonth() + 1;
  const monthStr = nextMonth.toString().padStart(2, '0');
  const prefix = `${nextYear}-${monthStr}-`;
  
  const q = query(
    collection(db, COLLECTION_NAME), 
    where('date', '>=', prefix),
    where('date', '<=', prefix + '\uf8ff'),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};
