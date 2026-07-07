import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { BookCard } from '../components/BookCard';
import { ArrowLeft, BookOpen, Target, HeartHandshake, Sparkles, Send, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PROFILES: Record<string, any> = {
  "5-7": {
    icon: "👶",
    title: "Làm Quen & Yêu Sách",
    color: "text-secondary",
    bg: "bg-secondary",
    border: "border-secondary",
    desc: "Độ tuổi vàng để bé làm quen với thế giới chữ viết qua hình ảnh sinh động và câu chuyện ngắn.",
    goals: ["Phát triển ngôn ngữ & vốn từ", "Kích thích trí tò mò, trí tưởng tượng", "Gắn kết tình cảm gia đình"],
    advice: "Lời khuyên: Bố mẹ nên đọc sách cùng bé mỗi tối 15 phút. Hãy giả giọng các nhân vật để câu chuyện thêm sinh động!"
  },
  "8-10": {
    icon: "🧒",
    title: "Tư Duy & Thói Quen",
    color: "text-primary",
    bg: "bg-primary",
    border: "border-primary",
    desc: "Giai đoạn trẻ bắt đầu tự đọc độc lập, tò mò về thế giới xung quanh và khoa học.",
    goals: ["Rèn luyện tư duy logic, phản biện", "Phát triển thói quen tự học", "Hiểu về cảm xúc & luật lệ xã hội"],
    advice: "Lời khuyên: Hãy để trẻ tự chọn sách theo sở thích. Sau khi đọc, khuyến khích trẻ tóm tắt lại cốt truyện cho bố mẹ nghe."
  },
  "11-15": {
    icon: "🎓",
    title: "Mở Rộng Nhận Thức",
    color: "text-accent",
    bg: "bg-accent",
    border: "border-accent",
    desc: "Thời kỳ quan trọng để hình thành nhân sinh quan, cá tính và kỹ năng sống độc lập.",
    goals: ["Suy luận đa chiều, hiểu tâm lý", "Khám phá và định vị bản thân", "Trang bị kỹ năng sống & hướng nghiệp"],
    advice: "Lời khuyên: Hãy giới thiệu những cuốn sách có chiều sâu, sách truyền cảm hứng hoặc gương vĩ nhân. Tôn trọng không gian riêng của trẻ."
  }
};

export const Suggestions: React.FC = () => {
  const { allBooks, loading } = useAppContext();
  const navigate = useNavigate();
  const [activeAge, setActiveAge] = useState<string | null>(null);

  // AI Matchmaker State
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary"></div>
      </div>
    );
  }

  const handleAskAI = async (age: string, booksForAge: any[]) => {
    if (!query.trim()) return;
    setIsAiLoading(true);
    setAiResponse('');
    
    // Create a mini context of available books
    const booksContext = booksForAge.map(b => `- ${b.title} (Tác giả: ${b.author}): ${b.desc}`).join('\n').substring(0, 3000);

    try {
      const res = await fetch('/api/suggest-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age, query, booksContext })
      });
      const data = await res.json();
      if (data.reply) setAiResponse(data.reply);
      else setAiResponse("Xin lỗi, hệ thống AI đang bận. Vui lòng thử lại sau.");
    } catch (err) {
      setAiResponse("Không thể kết nối với chuyên gia AI.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (activeAge) {
    const profile = PROFILES[activeAge];
    const books = allBooks.filter(b => {
      if (b.age !== activeAge) return false;
      const hasContent = b.content && b.content.replace(/<[^>]*>?/gm, '').trim() !== '';
      const hasPdf = b.pdfUrl && b.pdfUrl.trim() !== '';
      return hasContent || hasPdf;
    });

    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300 pb-32">
        <button 
          onClick={() => { setActiveAge(null); setAiResponse(''); setQuery(''); }}
          className="flex items-center gap-2 mb-6 text-muted font-bold hover:text-primary transition-colors bg-surface px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 w-fit"
        >
          <ArrowLeft size={18} />
          Trở về trang Chọn độ tuổi
        </button>

        {/* Pedagogy Profile Dashboard */}
        <div className={`mb-10 rounded-3xl overflow-hidden shadow-lg border-2 ${profile.border}`}>
          <div className={`${profile.bg} text-white p-6 md:p-8 relative overflow-hidden`}>
            <div className="absolute -right-4 -bottom-10 text-9xl opacity-20 transform -rotate-12">{profile.icon}</div>
            <div className="relative z-10">
              <h2 className="font-serif text-3xl md:text-4xl font-extrabold mb-3 flex items-center gap-3">
                <span>{profile.icon}</span> {profile.title}
              </h2>
              <p className="text-lg opacity-90 max-w-2xl font-medium">{profile.desc}</p>
            </div>
          </div>
          
          <div className="bg-surface p-6 md:p-8 grid md:grid-cols-2 gap-8 relative">
            <div>
              <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${profile.color}`}>
                <Target size={20} /> Mục tiêu phát triển:
              </h3>
              <ul className="space-y-3">
                {profile.goals.map((g: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-ink">
                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${profile.bg}`}></div>
                    <span className="font-medium">{g}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${profile.color}`}>
                <HeartHandshake size={20} /> Góc dành cho Phụ huynh:
              </h3>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-ink leading-relaxed italic">
                "{profile.advice}"
              </div>
            </div>
          </div>
        </div>

        {/* AI Matchmaker */}
        <div className="mb-12 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-3xl p-6 md:p-8 shadow-sm border border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-extrabold text-indigo-700 dark:text-indigo-400">Chuyên Gia Tư Vấn Chọn Sách (AI)</h3>
              <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80 font-medium">Tìm cuốn sách hoàn hảo nhất cho con bạn</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
            <input 
              type="text" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAskAI(activeAge, books)}
              placeholder="VD: Con tôi lười đọc chữ dài, thích khoa học và khám phá..."
              className="flex-1 px-5 py-4 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-ink outline-none focus:border-indigo-500 transition-colors shadow-sm"
            />
            <button 
              onClick={() => handleAskAI(activeAge, books)}
              disabled={isAiLoading || !query.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 whitespace-nowrap"
            >
              {isAiLoading ? <BrainCircuit className="animate-pulse" /> : <Send size={20} />}
              {isAiLoading ? 'Đang phân tích...' : 'Tư Vấn Ngay'}
            </button>
          </div>

          {aiResponse && (
            <div className="mt-6 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-800 shadow-sm animate-in slide-in-from-top-4">
              <p className="text-ink leading-relaxed whitespace-pre-line">{aiResponse}</p>
            </div>
          )}
        </div>

        {/* Book List */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-extrabold text-ink flex items-center gap-2">
            <BookOpen size={24} className={profile.color} /> 
            Kho Sách Phù Hợp ({books.length})
          </h2>
        </div>
        
        {books.length === 0 ? (
          <p className="text-center text-muted py-10 bg-surface rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">Chưa có sách nào trong độ tuổi này.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {books.map((book, idx) => (
              <BookCard key={book.id} book={book} index={idx} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Calculate book counts
  const countBooks = (age: string) => {
    return allBooks.filter(b => b.age === age && (b.content || b.pdfUrl)).length;
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="text-center py-10 relative mb-8">
        <div className="text-6xl mb-6 animate-bounce drop-shadow-md" style={{ animationDuration: '3s' }}>🎁</div>
        <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4 drop-shadow-sm">Kho Báu Tri Thức</h1>
        <p className="text-lg text-muted font-semibold max-w-2xl mx-auto">
          Mỗi lứa tuổi là một giai đoạn phát triển vàng. Hãy chọn đúng chìa khóa để mở khóa tiềm năng của trẻ!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(PROFILES).map(([ageKey, profile]) => (
          <div 
            key={ageKey}
            onClick={() => setActiveAge(ageKey)}
            className={`bg-surface rounded-3xl p-8 text-center cursor-pointer shadow-md hover:shadow-2xl transition-all hover:-translate-y-3 border border-slate-200 dark:border-slate-700 border-t-8 ${profile.border} group relative overflow-hidden flex flex-col h-full`}
          >
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${profile.bg} opacity-5 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-150`}></div>
            
            <div className="text-7xl mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12 drop-shadow-md">
              {profile.icon}
            </div>
            
            <h3 className="font-serif text-2xl font-extrabold mb-3 text-ink group-hover:text-primary transition-colors">
              {profile.title}
            </h3>
            
            <div className="inline-block bg-slate-100 dark:bg-slate-800 text-muted font-bold px-5 py-2 rounded-full mb-6 text-sm shadow-inner">
              Dành cho {ageKey} tuổi
            </div>
            
            <p className="text-muted text-sm mb-8 flex-1 font-medium px-2">
              {profile.desc}
            </p>
            
            <div className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md group-hover:shadow-lg ${profile.bg} text-white`}>
              Khám Phá Ngay ({countBooks(ageKey)} sách)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
