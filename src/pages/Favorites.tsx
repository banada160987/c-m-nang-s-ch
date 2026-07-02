import React from 'react';
import { useAppContext } from '../context/AppContext';
import { BookCard } from '../components/BookCard';

export const Favorites: React.FC = () => {
  const { allBooks, favorites } = useAppContext();
  
  const favBooks = favorites
    .map(id => allBooks.find(b => b.id === id))
    .filter((b): b is import('../types').Book => b !== undefined);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center py-10 relative">
        <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-primary mb-4">Tủ Sách Của Tôi</h1>
        <p className="text-lg text-muted italic">Những cuốn sách bạn yêu thích nhất</p>
      </div>
      
      {favBooks.length === 0 ? (
        <div className="text-center bg-surface p-12 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm mt-8">
          <div className="text-6xl mb-4">💔</div>
          <h3 className="text-2xl font-bold text-ink mb-2">Tủ sách trống</h3>
          <p className="text-muted">Bạn chưa lưu cuốn sách nào. Hãy thả tim ở các sách bạn thích để lưu lại nhé!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-4">
          {favBooks.map((book, idx) => (
            <BookCard key={book.id} book={book} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
};
