import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export interface BookReview {
  id?: string;
  bookId: string;
  author: string;
  text: string;
  createdAt: number;
}

export const getReviews = async (bookId: string): Promise<BookReview[]> => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('bookId', '==', bookId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookReview));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
};

export const addReview = async (review: Omit<BookReview, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'reviews'), review);
    return docRef.id;
  } catch (error) {
    console.error("Error adding review:", error);
    return null;
  }
};
