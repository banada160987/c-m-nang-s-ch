import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { BookCard } from '../components/BookCard';
import { Search, Library, PieChart, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const { readableBooks, allBooks, lastReadBookId, loading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [age, setAge] = useState('All');
  const navigate = useNavigate();

  const categories = ['All', 'Văn học', 'Khoa học', 'Lịch sử', 'Kỹ năng', 'Phiêu lưu', 'Tâm lý', 'Cổ tích'];
  const ages = [
    { id: 'All', label: 'Tất cả Lứa tuổi' },
    { id: '5-7', label: '5-7 tuổi' },
    { id: '8-10', label: '8-10 tuổi' },
    { id: '11-15', label: '11-15 tuổi' }
  ];

  const filteredBooks = useMemo(() => {
    return readableBooks.filter(b => {
      const matchCat = category === 'All' || b.cat === category;
      const matchAge = age === 'All' || b.age === age;
      const matchSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchAge && matchSearch;
    });
  }, [readableBooks, searchTerm, category, age]);

  const featuredBook = useMemo(() => {
    if (allBooks.length === 0) return null;
    return allBooks[Math.floor(Math.random() * allBooks.length)];
  }, [allBooks]);

  const lastReadBook = useMemo(() => {
    if (!lastReadBookId) return null;
    return allBooks.find(b => b.id === lastReadBookId);
  }, [lastReadBookId, allBooks]);

  const stats = useMemo(() => {
    const cats: Record<string, number> = {};
    let total = readableBooks.length;
    readableBooks.forEach(b => {
      cats[b.cat] = (cats[b.cat] || 0) + 1;
    });
    return { total, cats };
  }, [readableBooks]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Continue Reading Widget */}
      {lastReadBook && (
        <div 
          onClick={() => navigate(`/reader/${lastReadBook.id}`)}
          className="bg-gradient-to-r from-primary to-accent text-white p-4 md:p-5 rounded-2xl mb-8 flex items-center justify-between cursor-pointer shadow-lg shadow-primary/30 transition-transform hover:-translate-y-1 hover:shadow-xl ripple group"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl group-hover:scale-110 transition-transform hidden sm:block">📖</div>
            <div>
              <div className="text-sm opacity-90 font-bold mb-1 tracking-wider uppercase">Đang đọc dở...</div>
              <div className="font-serif font-extrabold text-lg md:text-2xl drop-shadow-md">{lastReadBook.title}</div>
            </div>
          </div>
          <div className="text-2xl bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition-colors">▶</div>
        </div>
      )}

      {/* 2. Link to Handbook CTA */}
      <div className="mb-8 bg-gradient-to-br from-secondary to-orange-400 rounded-3xl p-6 md:p-10 text-white shadow-xl shadow-secondary/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer hover:shadow-2xl transition-all hover:-translate-y-1"
           onClick={() => navigate('/suggestions')}
      >
        <div className="absolute -top-10 -right-10 text-9xl opacity-20 transform rotate-12">🎁</div>
        <div className="relative z-10 text-center md:text-left">
          <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-extrabold uppercase tracking-wider mb-3">
            Gợi ý chọn sách
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-extrabold mb-2 drop-shadow-md">Bạn chưa biết đọc gì?</h2>
          <p className="text-orange-50 font-semibold text-lg max-w-md">Hãy mở hộp thư Cẩm Nang Sách để khám phá những cuốn sách hay nhất dành riêng cho lứa tuổi của bạn nhé!</p>
        </div>
        <button className="relative z-10 bg-white text-secondary font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all text-lg whitespace-nowrap">
          🚀 Khám Phá Ngay
        </button>
      </div>

      {/* 3. Featured Book */}
      {featuredBook && (
        <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-emerald-600 to-emerald-400 text-white shadow-xl shadow-emerald-500/20 p-8 md:p-12 min-h-[250px] flex flex-col justify-center">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
          <div className="relative z-10 max-w-lg">
            <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-extrabold uppercase tracking-wider mb-4 border border-white/20">
              🌟 Khuyên Đọc Hôm Nay
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-extrabold mb-4 drop-shadow-md leading-tight">
              {featuredBook.title}
            </h1>
            <p className="text-emerald-50 text-lg mb-6 line-clamp-2">
              {featuredBook.desc || featuredBook.author || 'Một câu chuyện thú vị đang chờ bạn khám phá.'}
            </p>
            <button 
              onClick={() => navigate(`/reader/${featuredBook.id}`)}
              className="bg-white text-emerald-600 font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:translate-y-0"
            >
              📖 Đọc Ngay
            </button>
          </div>
        </div>
      )}

      {/* Statistics Section */}
      <div className="mb-10 bg-surface rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-6 text-primary">
          <PieChart size={24} />
          <h2 className="font-serif text-2xl font-extrabold">Thống Kê Kho Sách</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20 flex flex-col justify-center text-center">
            <div className="text-3xl font-extrabold text-primary mb-1">{stats.total}</div>
            <div className="text-sm font-bold text-primary/80 uppercase">Tổng số sách</div>
          </div>
          
          <div className="col-span-2 md:col-span-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(stats.cats).sort((a, b) => b[1] - a[1]).map(([catName, count]) => (
              <div key={catName} className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <div className="text-xl font-bold text-ink">{count}</div>
                <div className="text-xs text-muted font-semibold truncate w-full">{catName}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 relative">
        <input 
          type="text" 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm tên sách, tác giả..." 
          className="w-full max-w-md px-5 py-3 pl-12 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-surface text-ink outline-none transition-colors focus:border-primary shadow-sm"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar mb-2">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setCategory(cat)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold transition-all shadow-sm
              ${category === cat 
                ? 'bg-accent text-white shadow-md shadow-accent/30 scale-105' 
                : 'bg-surface border-2 border-transparent text-muted hover:border-accent/30 hover:text-accent'
              }`}
          >
            {cat === 'All' ? 'Tất cả Thể loại' : cat}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-6 hide-scrollbar">
        {ages.map(a => (
          <button 
            key={a.id}
            onClick={() => setAge(a.id)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold transition-all shadow-sm
              ${age === a.id 
                ? 'bg-secondary text-white shadow-md shadow-secondary/30 scale-105' 
                : 'bg-surface border-2 border-transparent text-muted hover:border-secondary/30 hover:text-secondary'
              }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {filteredBooks.length === 0 ? (
        <p className="text-center text-muted py-10 text-lg">Không tìm thấy cuốn sách nào phù hợp.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {filteredBooks.map((book, idx) => (
            <BookCard key={book.id} book={book} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
};
