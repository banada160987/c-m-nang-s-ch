import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Heart, ArrowLeft, Sun, Moon, Type, MessageCircle, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getReviews, addReview, BookReview } from '../services/reviewService';

export const Reader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation(); // To know where to go back
  const { allBooks, favorites, toggleFavorite, darkMode, toggleDarkMode, setLastReadBookId, updateStats, userName } = useAppContext();
  
  const [fontSize, setFontSize] = useState(1.1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ttsStatus, setTtsStatus] = useState<'idle' | 'loading' | 'playing'>('idle');
  const [showControls, setShowControls] = useState(true);
  const [showGamification, setShowGamification] = useState(false);
  
  // Reviews state
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  // AI Chat state
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endMarkRef = useRef<HTMLDivElement>(null);
  const sessionStartRef = useRef<number>(Date.now());
  const confettiFired = useRef(false);

  const book = allBooks.find(b => b.id === id);
  const isFav = book ? favorites.includes(book.id) : false;

  useEffect(() => {
    if (book) {
      setLastReadBookId(book.id);
      sessionStartRef.current = Date.now();
    }
    
    // Auto-hide controls on scroll
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setShowControls(false);
      } else {
        setShowControls(true);
      }
      lastScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
    // Fetch reviews
    if (book) {
      getReviews(book.id).then(setReviews);
    }
  }, [book, setLastReadBookId]);

  useEffect(() => {
    // End of book observer for Gamification
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !confettiFired.current) {
        confettiFired.current = true;
        updateStats(0, 1); // +1 book
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.8 } });
        setShowGamification(true);
      }
    }, { threshold: 1.0 });

    if (endMarkRef.current) {
      observer.observe(endMarkRef.current);
    }
    return () => observer.disconnect();
  }, [updateStats]);

  // Auto-hide Gamification Toast
  useEffect(() => {
    if (showGamification) {
      const timer = setTimeout(() => setShowGamification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showGamification]);

  // Save session time on unmount
  useEffect(() => {
    return () => {
      const mins = Math.floor((Date.now() - sessionStartRef.current) / 60000);
      if (mins > 0) {
        updateStats(mins, 0);
      }
    };
  }, [updateStats]);

  if (!book) {
    return <div className="p-8 text-center">Không tìm thấy sách.</div>;
  }

  const getWavUrlFromPcm = (base64: string, sampleRate = 24000) => {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    
    const buffer = new ArrayBuffer(44 + len);
    const view = new DataView(buffer);
    
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };
    
    writeString(0, 'RIFF'); view.setUint32(4, 36 + len, true); writeString(8, 'WAVE');
    writeString(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    writeString(36, 'data'); view.setUint32(40, len, true);
    
    new Uint8Array(buffer, 44).set(bytes);
    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  };

  const handleTTS = async () => {
    if (!audioRef.current) return;
    
    // Init audio context on mobile
    if (!audioRef.current.src) {
      audioRef.current.play().catch(() => {});
      audioRef.current.pause();
    }

    if (!audioRef.current.paused && audioRef.current.src) {
      audioRef.current.pause();
      setTtsStatus('idle');
      setIsPlaying(false);
      return;
    }
    
    if (audioRef.current.paused && audioRef.current.src) {
      audioRef.current.play();
      setTtsStatus('playing');
      setIsPlaying(true);
      return;
    }

    let textToRead = book.content || book.desc || "Xin lỗi, không có nội dung để đọc.";
    const tempSpan = document.createElement('div');
    tempSpan.innerHTML = textToRead;
    textToRead = tempSpan.textContent || tempSpan.innerText || "";
    
    if (textToRead.length > 3000) {
      textToRead = textToRead.substring(0, 3000) + "...";
    }

    setTtsStatus('loading');

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToRead })
      });
      
      if (!res.ok) throw new Error("Server error");
      
      const data = await res.json();
      if (data.audioBase64) {
        const wavUrl = getWavUrlFromPcm(data.audioBase64, 24000);
        audioRef.current.src = wavUrl;
        
        audioRef.current.onended = () => {
          setTtsStatus('idle');
          setIsPlaying(false);
        };
        
        audioRef.current.play().catch(err => {
          console.error(err);
          alert('Vui lòng bấm "Tiếp tục nghe" để phát âm thanh.');
        });
        setTtsStatus('playing');
        setIsPlaying(true);
      }
    } catch (error) {
      console.error(error);
      alert('Không thể tạo file âm thanh lúc này. Vui lòng thử lại sau!');
      setTtsStatus('idle');
    }
  };

  const hasTextContent = !!(book.content || book.desc);
  
  let finalPdfUrl = book.pdfUrl;
  if (finalPdfUrl && finalPdfUrl.includes('drive.google.com/file/d/')) {
    finalPdfUrl = finalPdfUrl.replace(/\/view.*$/, '/preview');
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim() || !book || !userName) return;
    
    setIsSubmittingReview(true);
    const reviewData = {
      bookId: book.id,
      author: userName,
      text: newReviewText.trim(),
      createdAt: Date.now()
    };
    
    const id = await addReview(reviewData);
    if (id) {
      setReviews([{ id, ...reviewData }, ...reviews]);
      setNewReviewText('');
    } else {
      alert("Lỗi khi đăng cảm nhận. Vui lòng thử lại!");
    }
    setIsSubmittingReview(false);
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    setIsAiLoading(true);

    try {
      const bookContext = `Tên sách: ${book?.title}\nTác giả: ${book?.author}\nMô tả: ${book?.desc}\nNội dung (một phần): ${book?.content ? book.content.substring(0, 1000) : 'Không có'}`;
      const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMessage, context: bookContext })
      });
      
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      
      setChatMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, { role: 'ai', text: "Xin lỗi, AI đang bận hoặc bị lỗi kết nối. Bạn thử lại sau nhé!" }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-32 animate-in fade-in">
      <audio ref={audioRef} className="hidden" />
      
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-muted font-bold hover:text-primary transition-colors bg-surface px-5 py-2.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 w-fit hover:shadow-md"
      >
        <ArrowLeft size={18} />
        Quay lại
      </button>

      <div 
        className={`flex items-center flex-wrap gap-2 mb-8 bg-surface p-3 rounded-2xl sticky top-4 z-10 shadow-sm border border-slate-200 dark:border-slate-700 transition-transform duration-300 ${showControls ? 'translate-y-0' : '-translate-y-[150%]'}`}
      >
        <button onClick={() => setFontSize(f => Math.min(2.0, f + 0.1))} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:text-primary transition-colors flex items-center gap-1 font-bold">
          <Type size={18} /> +
        </button>
        <button onClick={() => setFontSize(f => Math.max(0.8, f - 0.1))} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:text-primary transition-colors flex items-center gap-1 font-bold">
          <Type size={14} /> -
        </button>
        <button onClick={toggleDarkMode} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:text-primary transition-colors">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button 
          onClick={() => toggleFavorite(book.id)} 
          className={`p-2 rounded-xl transition-colors ml-auto flex items-center justify-center w-10 h-10 ${isFav ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}
        >
          <Heart size={20} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>

      <h1 className="font-serif text-3xl md:text-4xl font-extrabold mb-2 text-ink leading-tight">{book.title}</h1>
      
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <p className="text-muted italic text-lg">{book.author}</p>
        
        {hasTextContent && (
          <button 
            onClick={handleTTS}
            disabled={ttsStatus === 'loading'}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-full font-bold shadow-md shadow-accent/20 hover:shadow-lg transition-all active:scale-95 disabled:opacity-70"
          >
            {ttsStatus === 'idle' && <span>🔊 Nghe AI Đọc</span>}
            {ttsStatus === 'loading' && <span>⏳ Đang tạo...</span>}
            {ttsStatus === 'playing' && <span>⏸️ Đang đọc...</span>}
          </button>
        )}
      </div>

      {finalPdfUrl ? (
        <div className="w-full h-[80vh] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
          <iframe src={finalPdfUrl} className="w-full h-full border-none"></iframe>
        </div>
      ) : (
        <div 
          className="text-ink leading-relaxed transition-all"
          style={{ fontSize: fontSize + 'rem' }}
        >
          {book.content ? (
            <div dangerouslySetInnerHTML={{ __html: book.content.replace(/\\n/g, '<br/>') }} />
          ) : book.desc ? (
            <>
              <div className="bg-secondary/10 text-secondary italic p-4 border-l-4 border-secondary rounded-r-xl mb-6 font-semibold">
                Ghi chú: Đây chỉ là phần giới thiệu ngắn. Bản đọc chi tiết chưa được tải lên hệ thống.
              </div>
              <div dangerouslySetInnerHTML={{ __html: book.desc.replace(/\\n/g, '<br/>') }} />
            </>
          ) : (
            <p className="text-muted italic text-center py-10">Nội dung văn bản chưa được cập nhật cho cuốn sách này.</p>
          )}
        </div>
      )}

      <div ref={endMarkRef} className="h-4 mt-20"></div>

      {/* AI Chat Section */}
      <div className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-3xl p-6 md:p-8 shadow-sm border border-indigo-100 dark:border-indigo-900/50">
        <h2 className="text-2xl font-serif font-extrabold flex items-center gap-2 mb-6 text-indigo-700 dark:text-indigo-400">
          <span className="text-2xl">🤖</span> Trợ lý AI (Hỏi đáp về sách)
        </h2>
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-inner mb-4 overflow-hidden border border-slate-100 dark:border-slate-800">
          <div className="h-[300px] overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 opacity-70">
                <span className="text-4xl">✨</span>
                <p>Hãy hỏi tôi bất kỳ điều gì về cuốn sách này!</p>
                <p className="text-sm">VD: "Hãy tóm tắt ngắn gọn cuốn sách"</p>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-slate-100 dark:bg-slate-800 text-ink rounded-bl-none'
                  }`}>
                    {msg.role === 'ai' ? (
                      <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))
            )}
            {isAiLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 text-ink rounded-2xl rounded-bl-none p-4 flex gap-1">
                  <span className="animate-bounce inline-block w-2 h-2 bg-indigo-500 rounded-full"></span>
                  <span className="animate-bounce inline-block w-2 h-2 bg-indigo-500 rounded-full" style={{animationDelay: '0.2s'}}></span>
                  <span className="animate-bounce inline-block w-2 h-2 bg-indigo-500 rounded-full" style={{animationDelay: '0.4s'}}></span>
                </div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleAskAI} className="relative">
          <input 
            type="text" 
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            disabled={isAiLoading}
            placeholder="Bạn muốn hỏi gì về cuốn sách này?"
            className="w-full bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-900 rounded-full py-4 pl-6 pr-16 outline-none focus:border-indigo-500 transition-colors text-ink shadow-sm disabled:opacity-70"
          />
          <button 
            type="submit" 
            disabled={isAiLoading || !chatInput.trim()}
            className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white rounded-full w-10 md:w-12 flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} className={isAiLoading ? 'animate-pulse' : ''} />
          </button>
        </form>
      </div>

      {/* Reviews Section */}
      <div className="mt-8 bg-surface rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-serif font-extrabold flex items-center gap-2 mb-6">
          <MessageCircle className="text-primary" /> Góc Cảm Nhận
        </h2>
        
        {!userName ? (
          <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl text-center mb-8">
            <p className="text-muted font-semibold mb-4">Vui lòng nhập Biệt danh ở Bảng Xếp Hạng hoặc Hồ Sơ để viết cảm nhận nhé!</p>
            <button onClick={() => navigate('/leaderboard')} className="bg-primary text-white font-bold py-2 px-6 rounded-full hover:shadow-lg transition-all">
              Đến Bảng Xếp Hạng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="mb-8 relative">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0 uppercase">
                {userName.charAt(0)}
              </div>
              <div className="flex-1">
                <textarea 
                  value={newReviewText}
                  onChange={e => setNewReviewText(e.target.value)}
                  placeholder="Bạn cảm thấy cuốn sách này thế nào? Hãy chia sẻ nhé..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 outline-none focus:border-primary transition-colors min-h-[100px] text-ink"
                  required
                />
                <div className="flex justify-end mt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmittingReview || !newReviewText.trim()}
                    className="bg-primary text-white font-bold py-2 px-6 rounded-full hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingReview ? 'Đang đăng...' : (
                      <>Đăng <Send size={16} /></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center text-muted italic py-8">Chưa có cảm nhận nào. Hãy là người đầu tiên nhé!</div>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-500 uppercase">
                    {review.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-ink">{review.author}</div>
                    <div className="text-xs text-muted">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                </div>
                <p className="text-ink leading-relaxed pl-11">{review.text}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Gamification Toast */}
      {showGamification && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 p-4 animate-in slide-in-from-bottom-10 fade-in duration-500 w-full max-w-sm pointer-events-none">
          <div className="bg-surface/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl shadow-primary/20 border-2 border-primary/20 flex items-center gap-3 pointer-events-auto">
            <div className="text-4xl animate-bounce" style={{ animationDuration: '2s' }}>🌟</div>
            <div className="flex-1">
              <h3 className="font-bold text-primary mb-0.5 text-sm">Tuyệt vời! Bạn đã đọc xong!</h3>
              <p className="text-muted text-xs leading-tight">Cây Tri Thức của bạn đã lớn thêm. Xem tại Bảng Vàng nhé!</p>
            </div>
            <button 
              onClick={() => setShowGamification(false)}
              className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
