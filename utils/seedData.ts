import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MOCK_BUSINESSES, MOCK_CAMPAIGNS, MOCK_CLASSIFIEDS, MOCK_REVIEWS } from '../constants/mockData';
import { CATEGORIES } from '../constants/categories';

// Temporary utility function to seed Firestore with initial mock data
// This should only be run once by an admin to populate an empty database

export const seedFirestore = async () => {
  try {
    console.log('Seeding Businesses...');
    for (const business of MOCK_BUSINESSES) {
      await setDoc(doc(db, 'businesses', business.id), {
        ...business,
        createdAt: new Date().toISOString()
      });
    }

    console.log('Seeding Categories...');
    for (const category of CATEGORIES) {
      await setDoc(doc(db, 'categories', category.id), {
        ...category,
      });
    }

    console.log('Seeding Campaigns...');
    for (const campaign of MOCK_CAMPAIGNS) {
      await setDoc(doc(db, 'campaigns', campaign.id), {
        ...campaign,
        createdAt: new Date().toISOString()
      });
    }

    console.log('Seeding Classifieds...');
    for (const classified of MOCK_CLASSIFIEDS) {
      await setDoc(doc(db, 'classifieds', classified.id), {
        ...classified,
        // if the date is just text like 'Dün', we'll keep it for now
        timestamp: new Date().toISOString()
      });
    }

    console.log('Seeding Reviews...');
    for (const review of MOCK_REVIEWS) {
      await setDoc(doc(db, 'reviews', review.id), {
        ...review,
      });
    }

    console.log('Seeding Complete!');
    return true;
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
};
