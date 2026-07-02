import { collection, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Book } from '../types';

export const getReadableBooks = async (): Promise<Book[]> => {
  const snapshot = await getDocs(collection(db, 'readable_books'));
  
  // Keep original logic mapping IDs to age
  const bookAges: Record<string, string> = {
    'r1': '8-10', 'r2': '8-10', 'r3': '5-7', 'r4': '8-10', 'r5': '11-15', 
    'r6': '8-10', 'r7': '8-10', 'r8': '11-15', 'r9': '11-15', 'r10': '8-10',
    'r11': '11-15', 'r12': '8-10', 'r13': '8-10', 'r14': '8-10', 'r15': '8-10',
    'r16': '8-10', 'r17': '11-15', 'r18': '11-15', 'r19': '11-15', 'r20': '11-15'
  };

  return snapshot.docs.map(doc => {
    const data = doc.data();
    if (!data.age && bookAges[doc.id]) {
      data.age = bookAges[doc.id];
    }
    return { id: doc.id, ...data } as Book;
  });
};

export const getSuggestedBooks = async (): Promise<Book[]> => {
  const snapshot = await getDocs(collection(db, 'suggested_books'));
  return snapshot.docs.map(doc => {
    const data = doc.data();
    if (data.age === '11-13' || data.age === '14-15') {
      data.age = '11-15';
    }
    return { id: doc.id, ...data } as Book;
  });
};

export const addBook = async (collectionName: string, book: Omit<Book, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, collectionName), book);
  return docRef.id;
};

export const uploadPdf = async (file: File, onProgress?: (p: number) => void): Promise<string> => {
  const storageRef = ref(storage, 'books/' + Date.now() + '_' + file.name);
  if (onProgress) onProgress(10);
  await uploadBytes(storageRef, file);
  if (onProgress) onProgress(80);
  const downloadUrl = await getDownloadURL(storageRef);
  if (onProgress) onProgress(100);
  return downloadUrl;
};
