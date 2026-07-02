import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, UserStats } from '../types';
import { getReadableBooks, getSuggestedBooks } from '../services/bookService';
import { updateLeaderboard } from '../services/leaderboardService';

interface AppContextType {
  readableBooks: Book[];
  suggestedBooks: Book[];
  loading: boolean;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  stats: UserStats;
  updateStats: (minutes: number, books: number) => void;
  lastReadBookId: string | null;
  setLastReadBookId: (id: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  allBooks: Book[]; // combined list
  userName: string;
  setUserName: (name: string) => void;
  userId: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [readableBooks, setReadableBooks] = useState<Book[]>([]);
  const [suggestedBooks, setSuggestedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('bookFavorites') || '[]');
    } catch {
      return [];
    }
  });

  const [stats, setStats] = useState<UserStats>(() => {
    try {
      return JSON.parse(localStorage.getItem('userStats') || '{"minutes": 0, "books": 0}');
    } catch {
      return { minutes: 0, books: 0 };
    }
  });

  const [lastReadBookId, setLastReadBookIdState] = useState<string | null>(() => {
    return localStorage.getItem('lastReadBookId');
  });

  const [darkMode, setDarkMode] = useState<boolean>(false);

  const [userId] = useState<string>(() => {
    let id = localStorage.getItem('userId');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', id);
    }
    return id;
  });

  const [userName, setUserNameState] = useState<string>(() => {
    return localStorage.getItem('userName') || '';
  });

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem('userName', name);
    // Sync immediately if they have stats
    if (stats.minutes > 0) {
      updateLeaderboard({
        id: userId,
        name: name,
        minutesRead: stats.minutes,
        booksRead: stats.books,
        lastUpdated: Date.now()
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [readable, suggested] = await Promise.all([
          getReadableBooks(),
          getSuggestedBooks()
        ]);
        setReadableBooks(readable);
        setSuggestedBooks(suggested);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavs = prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id];
      localStorage.setItem('bookFavorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const updateStats = (minutes: number, books: number) => {
    setStats(prev => {
      const newStats = { minutes: prev.minutes + minutes, books: prev.books + books };
      localStorage.setItem('userStats', JSON.stringify(newStats));
      
      if (userName && newStats.minutes > 0) {
        updateLeaderboard({
          id: userId,
          name: userName,
          minutesRead: newStats.minutes,
          booksRead: newStats.books,
          lastUpdated: Date.now()
        });
      }
      
      return newStats;
    });
  };

  const setLastReadBookId = (id: string) => {
    setLastReadBookIdState(id);
    localStorage.setItem('lastReadBookId', id);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      if (next) document.body.classList.add('dark');
      else document.body.classList.remove('dark');
      return next;
    });
  };

  const allBooks = [...readableBooks, ...suggestedBooks];

  return (
    <AppContext.Provider value={{
      readableBooks,
      suggestedBooks,
      loading,
      favorites,
      toggleFavorite,
      stats,
      updateStats,
      lastReadBookId,
      setLastReadBookId,
      darkMode,
      toggleDarkMode,
      allBooks,
      userName,
      setUserName,
      userId
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
