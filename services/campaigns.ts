import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MOCK_CAMPAIGNS, Campaign } from '../constants/mockData';

const COLLECTION_NAME = 'campaigns';

export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('No campaigns found in Firebase. Falling back to local data.');
      return MOCK_CAMPAIGNS;
    }
    
    const campaigns: Campaign[] = [];
    snapshot.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() } as Campaign);
    });
    
    return campaigns;
  } catch (error: any) {
    console.log('Error fetching campaigns from Firebase:', error.message);
    console.log('Using local mock campaigns as fallback.');
    return MOCK_CAMPAIGNS;
  }
};

export const seedCampaigns = async (): Promise<void> => {
  try {
    const promises = MOCK_CAMPAIGNS.map((campaign) => {
      const campaignRef = doc(db, COLLECTION_NAME, campaign.id);
      return setDoc(campaignRef, campaign);
    });
    
    await Promise.all(promises);
    console.log('Successfully seeded campaigns to Firebase!');
  } catch (error) {
    console.error('Error seeding campaigns:', error);
    throw error;
  }
};

export const createCampaign = async (campaignData: Omit<Campaign, 'id'>): Promise<string> => {
  try {
    const docRef = doc(collection(db, COLLECTION_NAME));
    await setDoc(docRef, { ...campaignData, id: docRef.id });
    return docRef.id;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

export const updateCampaignStatus = async (id: string, status: 'active' | 'inactive' | 'pending' | 'rejected') => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, { status }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating campaign:', error);
    throw error;
  }
};

export const deleteCampaign = async (id: string) => {
  try {
    const { deleteDoc } = require('firebase/firestore');
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return true;
  } catch (error) {
    console.error('Error deleting campaign:', error);
    throw error;
  }
};
