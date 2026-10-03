import { collection, query, where, getDocs, doc, updateDoc, setDoc, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { BusinessApplication } from './applications';

// Fetch pending applications
export const getPendingApplications = async () => {
  try {
    const q = query(collection(db, 'applications'), where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (BusinessApplication & { id: string, createdAt: any })[];
  } catch (error) {
    console.error('Error fetching pending applications:', error);
    throw error;
  }
};

// Approve an application
export const approveApplication = async (applicationId: string, applicationData: BusinessApplication, assignedCategory: string) => {
  try {
    // 1. Update application status
    await updateDoc(doc(db, 'applications', applicationId), {
      status: 'approved',
      approvedAt: serverTimestamp(),
      assignedCategory
    });

    // 2. Create the business in the businesses collection
    // We use the application's userId as the businessId or create a new ID
    // Let's create a new document in businesses
    const businessRef = doc(collection(db, 'businesses'));
    await setDoc(businessRef, {
      ownerId: applicationData.userId,
      name: applicationData.name,
      description: applicationData.description || '',
      category: assignedCategory,
      phone: applicationData.phone,
      whatsapp: applicationData.whatsapp || '',
      address: applicationData.address,
      rating: 0,
      reviewCount: 0,
      status: 'approved',
      createdAt: serverTimestamp(),
    });

    // 3. Update the user's role to 'business'
    const userRef = doc(db, 'users', applicationData.userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        role: 'business'
      });
    }

    return true;
  } catch (error) {
    console.error('Error approving application:', error);
    throw error;
  }
};

// Reject an application
export const rejectApplication = async (applicationId: string) => {
  try {
    await updateDoc(doc(db, 'applications', applicationId), {
      status: 'rejected',
      rejectedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error rejecting application:', error);
    throw error;
  }
};

// Get all businesses (for admin panel)
export const getAllBusinesses = async () => {
  try {
    const q = query(collection(db, 'businesses'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching all businesses:', error);
    throw error;
  }
};

// Hide business
export const hideBusiness = async (businessId: string) => {
  try {
    await updateDoc(doc(db, 'businesses', businessId), {
      status: 'hidden',
      hiddenAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error hiding business:', error);
    throw error;
  }
};

// Delete business permanently
export const deleteBusiness = async (businessId: string) => {
  try {
    await deleteDoc(doc(db, 'businesses', businessId));
    return true;
  } catch (error) {
    console.error('Error deleting business:', error);
    throw error;
  }
};
