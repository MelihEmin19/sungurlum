import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Uploads an image file to Firebase Storage
 * @param uri The local URI of the image
 * @param path The path in Firebase Storage (e.g., 'classifieds/images')
 * @returns The public download URL of the uploaded image
 */
export const uploadImageAsync = async (uri: string, path: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Generate a unique filename
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const storageRef = ref(storage, `${path}/${filename}`);
    
    // Upload
    const uploadTask = await uploadBytesResumable(storageRef, blob);
    
    // Get URL
    const downloadURL = await getDownloadURL(uploadTask.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image: ', error);
    throw error;
  }
};
