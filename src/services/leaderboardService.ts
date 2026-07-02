import { collection, doc, getDocs, setDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

export interface LeaderboardEntry {
  id: string;
  name: string;
  minutesRead: number;
  booksRead: number;
  lastUpdated: number;
}

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const q = query(
      collection(db, 'leaderboard'),
      orderBy('minutesRead', 'desc'),
      limit(10)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaderboardEntry));
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};

export const updateLeaderboard = async (entry: LeaderboardEntry): Promise<void> => {
  try {
    const docRef = doc(db, 'leaderboard', entry.id);
    await setDoc(docRef, entry);
  } catch (error) {
    console.error("Error updating leaderboard:", error);
  }
};
