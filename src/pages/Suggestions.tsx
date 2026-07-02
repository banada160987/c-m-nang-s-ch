import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { BookCard } from '../components/BookCard';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TITLES: Record<string, string> = {
  "5-7": "👶 Làm Quen & Yêu Sách",
  "8-10": "🧒 Tư Duy & Thói Quen",
  "11-15": "👦 Mở Rộng Nhận Thức"
};

export const Suggestions: React.FC = () => {
  const { allBooks, loading } = useAppContext();
  const navigate = useNavigate();
  const [activeAge, setActiveAge] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary"></div>
      </div>
    );
  }

  if (activeAge) {
    const books = allBooks.filter(b => b.age === activeAge);
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => setActiveAge(null)}
          className="flex items-center gap-2 mb-6 text-muted font-bold hover:text-primary transition-colors bg-surface px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 w-fit"
        >
          <ArrowLeft size={18} />
          Trở về Cẩm Nang
        </button>
        <h2 className="font-serif text-3xl font-extrabold mb-8 text-ink">{TITLES[activeAge]}</h2>
        
        {books.length === 0 ? (
          <p className="text-center text-muted">Chưa có gợi ý nào cho lứa tuổi này.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {books.map((book, idx) => (
              <BookCard key={book.id} book={book} index={idx} />
            ))}
          </div>
        )}

        <div className="mt-12 bg-primary/10 border border-primary/20 p-8 rounded-3xl text-center">
          <div className="text-5xl mb-4 animate-bounce" style={{ animationDuration: '2s' }}>🚀</div>
          <h3 className="font-serif text-2xl font-bold text-primary mb-2">Chưa tìm thấy sách ưng ý?</h3>
          <p className="text-muted mb-6 max-w-md mx-auto">Kho Sách chính vẫn còn hàng trăm cuốn sách thú vị khác đang chờ bạn khám phá đấy!</p>
          <button 
            onClick={() => { setActiveAge(null); navigate('/'); }}
            className="bg-primary text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-primary/30 hover:-translate-y-1 hover:shadow-xl transition-all"
          >
            Quay lại Kho Sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center py-10 relative">
        <div className="text-5xl mb-4 animate-bounce" style={{ animationDuration: '3s' }}>💌</div>
        <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4 drop-shadow-sm">Cẩm Nang Đọc Sách</h1>
        <p className="text-lg text-muted font-semibold">Chọn độ tuổi để khám phá hộp thư sách gợi ý bí mật nhé!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          onClick={() => setActiveAge('5-7')}
          className="bg-surface rounded-3xl p-8 text-center cursor-pointer shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border border-slate-200 dark:border-slate-700 border-t-8 border-t-secondary group relative overflow-hidden"
        >
          <div className="text-6xl mb-4 transition-transform group-hover:scale-110 group-hover:-rotate-6">👶</div>
          <h3 className="font-serif text-2xl font-bold mb-2 text-ink">Làm Quen & Yêu Sách</h3>
          <div className="inline-block bg-slate-100 dark:bg-slate-800 text-muted font-bold px-4 py-1.5 rounded-full mb-6 text-sm">
            5-7 tuổi
          </div>
          <div className="text-secondary font-bold flex items-center justify-center gap-2">
            👆 Nhấn để xem sách
          </div>
        </div>

        <div 
          onClick={() => setActiveAge('8-10')}
          className="bg-surface rounded-3xl p-8 text-center cursor-pointer shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border border-slate-200 dark:border-slate-700 border-t-8 border-t-primary group relative overflow-hidden"
        >
          <div className="text-6xl mb-4 transition-transform group-hover:scale-110 group-hover:-rotate-6">🧒</div>
          <h3 className="font-serif text-2xl font-bold mb-2 text-ink">Tư Duy & Thói Quen</h3>
          <div className="inline-block bg-slate-100 dark:bg-slate-800 text-muted font-bold px-4 py-1.5 rounded-full mb-6 text-sm">
            8-10 tuổi
          </div>
          <div className="text-primary font-bold flex items-center justify-center gap-2">
            👆 Nhấn để xem sách
          </div>
        </div>

        <div 
          onClick={() => setActiveAge('11-15')}
          className="bg-surface rounded-3xl p-8 text-center cursor-pointer shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border border-slate-200 dark:border-slate-700 border-t-8 border-t-accent group relative overflow-hidden md:col-span-2 lg:col-span-1"
        >
          <div className="text-6xl mb-4 transition-transform group-hover:scale-110 group-hover:-rotate-6">🎓</div>
          <h3 className="font-serif text-2xl font-bold mb-2 text-ink">Mở Rộng Nhận Thức</h3>
          <div className="inline-block bg-slate-100 dark:bg-slate-800 text-muted font-bold px-4 py-1.5 rounded-full mb-6 text-sm">
            11-15 tuổi
          </div>
          <div className="text-accent font-bold flex items-center justify-center gap-2">
            👆 Nhấn để xem sách
          </div>
        </div>
      </div>
    </div>
  );
};
