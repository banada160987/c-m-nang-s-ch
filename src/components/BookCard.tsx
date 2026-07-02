import React, { useEffect, useState } from 'react';
import { Book } from '../types';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { getBookCover } from '../utils/coverLoader';
import { Heart } from 'lucide-react';

interface BookCardProps {
  book: Book;
  index?: number;
}

export const BookCard: React.FC<BookCardProps> = ({ book, index }) => {
  const { favorites, toggleFavorite } = useAppContext();
  const navigate = useNavigate();
  const [cover, setCover] = useState<string>('data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=');
  
  const isFav = favorites.includes(book.id);

  useEffect(() => {
    getBookCover(book.title, book.author, book.id).then(url => setCover(url));
  }, [book.id, book.title, book.author]);

  return (
    <div 
      className={`bg-surface rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-700 flex flex-col transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/15 hover:border-primary dark:hover:border-primary relative group cursor-pointer stagger-item`}
      style={{ animationDelay: index !== undefined ? `${index * 0.08}s` : '0s' }}
      onClick={() => navigate(`/reader/${book.id}`)}
    >
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        {book.cat && (
          <span className="absolute top-2 left-2 bg-white/90 dark:bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-xs font-extrabold text-primary shadow-sm z-10">
            {book.cat}
          </span>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); toggleFavorite(book.id); }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur shadow-sm z-10 transition-transform hover:scale-110 
            ${isFav ? 'bg-white/90 text-red-500 dark:bg-slate-800/90' : 'bg-white/70 text-slate-400 dark:bg-slate-800/70'}`}
        >
          <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
        </button>
        <img 
          src={cover} 
          alt={book.title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h4 className="font-serif font-extrabold text-lg leading-snug mb-1 line-clamp-2 text-ink">
          {book.title}
        </h4>
        <div className="text-muted text-sm font-semibold mb-3 truncate">
          {book.author}
        </div>
        <button className="mt-auto w-full bg-gradient-to-br from-primary to-accent text-white font-bold py-2.5 rounded-xl shadow-md shadow-primary/20 transition-all group-hover:shadow-lg group-hover:-translate-y-0.5 ripple">
          Đọc ngay
        </button>
      </div>
    </div>
  );
};
