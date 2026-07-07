import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Heart, ArrowLeft, Sun, Moon, Type, MessageCircle, Send, Feather, Sparkles, Lightbulb, Headphones, Mic, MicOff, Maximize2, Minimize2, BookOpen, ScrollText, Volume2, VolumeX, Eye, Network, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Mermaid } from '../components/Mermaid';
import { getReviews, addReview, BookReview } from '../services/reviewService';

export const Reader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation(); // To know where to go back
  const { allBooks, favorites, toggleFavorite, darkMode, toggleDarkMode, setLastReadBookId, updateStats, userName, globalAudio, setGlobalAudio } = useAppContext();
  
  const [fontSize, setFontSize] = useState(1.1);
  const [ttsStatus, setTtsStatus] = useState<'idle' | 'loading'>('idle');
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
  
  // Quiz state
  const [quizData, setQuizData] = useState<{question: string, options: string[], correctIndex: number}[] | null>(null);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  
  // New Features State
  const [isImmersive, setIsImmersive] = useState(false);
  const [ambientAudio, setAmbientAudio] = useState(false);
  const [viewMode, setViewMode] = useState<'scroll' | 'pages'>('scroll');
  const [dictWord, setDictWord] = useState<string | null>(null);
  const [dictDef, setDictDef] = useState<string | null>(null);
  const [dictLoading, setDictLoading] = useState(false);
  const [dictPos, setDictPos] = useState({ x: 0, y: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // KHKT Features
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [mindmapCode, setMindmapCode] = useState<string | null>(null);
  const [isMindmapLoading, setIsMindmapLoading] = useState(false);
  
  // Giao diện thuần Việt - Trợ lý & Thẻ ghi nhớ
  const [isListening, setIsListening] = useState(false);
  const [flashcards, setFlashcards] = useState<{front: string, back: string}[] | null>(null);
  const [isFlashcardLoading, setIsFlashcardLoading] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const endMarkRef = useRef<HTMLDivElement>(null);
  const sessionStartRef = useRef<number>(Date.now());
  const confettiFired = useRef(false);

  const book = allBooks.find(b => b.id === id);
  const isFav = book ? favorites.includes(book.id) : false;
  const isPlayingGlobal = globalAudio.bookId === id && globalAudio.url !== null;

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

  useEffect(() => {
    if (ambientAudio) {
      if (!audioRef.current) {
        audioRef.current = new Audio('https://cdn.pixabay.com/download/audio/2022/05/16/audio_9b6574aefd.mp3'); // Lo-Fi study music
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
      }
      audioRef.current.play().catch(()=>setAmbientAudio(false));
    } else {
      audioRef.current?.pause();
    }
    return () => audioRef.current?.pause();
  }, [ambientAudio]);

  const handleTextSelection = async () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 1 && text.length < 30) {
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      if (rect) {
        setDictPos({ x: rect.left + rect.width / 2, y: rect.top + window.scrollY - 10 });
        setDictWord(text);
        setDictLoading(true);
        setDictDef(null);
        
        try {
          const res = await fetch('/api/dictionary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word: text, context: book?.title || "" })
          });
          const data = await res.json();
          setDictDef(data.definition);
        } catch (e) {
          setDictDef("Lỗi tra từ. Vui lòng thử lại.");
        } finally {
          setDictLoading(false);
        }
      }
    } else {
      setDictWord(null);
    }
  };

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
    if (isPlayingGlobal) {
      // Just open/close or do nothing, handled by GlobalAudioPlayer
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
        setGlobalAudio({ url: wavUrl, title: book.title, bookId: book.id });
        setTtsStatus('idle');
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
      const bookContext = `Bạn đang đóng vai là Tác giả của cuốn sách hoặc Nhân vật chính. Hãy trả lời câu hỏi của độc giả bằng giọng điệu kể chuyện, xưng hô gần gũi, thân thiện. \nThông tin sách: Tên sách: ${book?.title}\nTác giả: ${book?.author}\nMô tả: ${book?.desc}\nNội dung (một phần): ${book?.content ? book.content.substring(0, 1000) : 'Không có'}`;
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

  const handleGenerateQuiz = async () => {
    setIsQuizLoading(true);
    const bookContext = `Tên sách: ${book.title}\nTác giả: ${book.author}\nNội dung:\n${book.content || book.desc || ""}`.substring(0, 5000);
    
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: bookContext })
      });
      
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      setQuizData(data);
      setQuizAnswers({});
      setShowQuizResult(false);
    } catch (error) {
      console.error(error);
      alert("Không thể tạo câu hỏi lúc này. Bạn thử lại sau nhé!");
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleGenerateMindmap = async () => {
    setIsMindmapLoading(true);
    const bookContext = `Tên sách: ${book.title}\nTác giả: ${book.author}\nMô tả: ${book.desc || ''}\n${book.content || ''}`.substring(0, 3000);
    
    try {
      const res = await fetch('/api/generate-mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: bookContext })
      });
      
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      setMindmapCode(data.mermaid);
    } catch (error) {
      console.error(error);
      alert("Không thể tạo sơ đồ tư duy lúc này. Bạn thử lại sau nhé!");
    } finally {
      setIsMindmapLoading(false);
    }
  };

  const handleVoiceCommand = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói (Khuyên dùng Google Chrome).");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleGenerateFlashcards = async () => {
    setIsFlashcardLoading(true);
    const bookContext = `Tên sách: ${book.title}\nTác giả: ${book.author}\nMô tả: ${book.desc || ''}\n${book.content || ''}`.substring(0, 3000);
    try {
      const res = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: bookContext })
      });
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      setFlashcards(data);
      setActiveCardIndex(0);
      setIsCardFlipped(false);
    } catch (error) {
      console.error(error);
      alert("Không thể tạo thẻ ghi nhớ lúc này.");
    } finally {
      setIsFlashcardLoading(false);
    }
  };

  const submitQuiz = () => {
    if (!quizData) return;
    let score = 0;
    quizData.forEach((q, i) => {
      if (quizAnswers[i] === q.correctIndex) score++;
    });
    setQuizScore(score);
    setShowQuizResult(true);
    
    if (score > 0) {
      updateStats(score * 10, 0); // 10 minutes XP per correct answer
      confetti({ particleCount: score * 50, spread: 60, origin: { y: 0.6 } });
    }
  };

  if (isImmersive) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 text-slate-200 overflow-y-auto pt-20 px-4 md:px-20 pb-40">
        <div className="max-w-4xl mx-auto relative">
          <div className="fixed top-6 right-6 flex gap-4 opacity-30 hover:opacity-100 transition-opacity">
            <button onClick={() => setAmbientAudio(!ambientAudio)} className="p-3 bg-slate-800 rounded-full hover:bg-slate-700">
              {ambientAudio ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
            <button onClick={() => setIsImmersive(false)} className="p-3 bg-slate-800 rounded-full hover:bg-slate-700">
              <Minimize2 size={24} />
            </button>
          </div>
          
          <h1 className="font-serif text-4xl md:text-5xl font-extrabold mb-12 text-center text-slate-100 opacity-50">{book.title}</h1>
          
          <div 
            onMouseUp={handleTextSelection}
            className={`text-slate-300 leading-loose transition-all font-serif selection:bg-emerald-500/30 selection:text-emerald-100 ${dyslexiaMode ? 'font-sans tracking-[0.1em]' : ''}`}
            style={{ fontSize: (fontSize + 0.2) + 'rem' }}
          >
            {book.content ? (
              <div dangerouslySetInnerHTML={{ __html: book.content.replace(/\n/g, '<br/>') }} />
            ) : book.desc ? (
              <div dangerouslySetInnerHTML={{ __html: book.desc.replace(/\n/g, '<br/>') }} />
            ) : null}
          </div>
        </div>

        {dictWord && (
          <div 
            className="absolute z-[110] bg-slate-800 text-slate-100 p-4 rounded-2xl shadow-2xl border border-slate-700 max-w-xs transform -translate-x-1/2 -translate-y-full mb-4 animate-in fade-in zoom-in-95"
            style={{ left: dictPos.x, top: dictPos.y }}
          >
            <div className="font-bold text-emerald-400 mb-1 border-b border-slate-700 pb-1 flex items-center justify-between">
              <span>{dictWord}</span>
              <button onClick={() => setDictWord(null)} className="text-slate-500 hover:text-slate-300">×</button>
            </div>
            {dictLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                <BrainCircuit size={14} className="animate-pulse text-emerald-500" /> Đang tìm câu trả lời...
              </div>
            ) : (
              <p className="text-sm leading-relaxed">{dictDef}</p>
            )}
            <div className="absolute w-3 h-3 bg-slate-800 border-b border-r border-slate-700 transform rotate-45 -bottom-1.5 left-1/2 -translate-x-1/2"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-32 animate-in fade-in relative">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-muted font-bold hover:text-primary transition-colors bg-surface px-5 py-2.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 w-fit hover:shadow-md"
      >
        <ArrowLeft size={18} />
        Quay lại
      </button>

      <div 
        className={`flex items-center flex-wrap gap-2 mb-8 bg-surface p-3 rounded-2xl sticky top-4 z-40 shadow-sm border border-slate-200 dark:border-slate-700 transition-transform duration-300 ${showControls ? 'translate-y-0' : '-translate-y-[150%]'}`}
      >
        {!book.pdfUrl && (
          <>
            <button onClick={() => setFontSize(f => Math.min(2.0, f + 0.1))} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:text-primary transition-colors flex items-center gap-1 font-bold">
              <Type size={18} /> +
            </button>
            <button onClick={() => setFontSize(f => Math.max(0.8, f - 0.1))} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:text-primary transition-colors flex items-center gap-1 font-bold">
              <Type size={14} /> -
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <button onClick={() => setViewMode(v => v === 'scroll' ? 'pages' : 'scroll')} className="p-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 transition-colors" title="Chế độ Đọc">
              {viewMode === 'scroll' ? <ScrollText size={20} /> : <BookOpen size={20} />}
            </button>
            <button onClick={() => setIsImmersive(true)} className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-colors" title="Chế độ Đắm chìm">
              <Maximize2 size={20} />
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <button onClick={() => setDyslexiaMode(!dyslexiaMode)} className={`p-2 rounded-xl transition-colors flex items-center gap-1 font-bold ${dyslexiaMode ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-800 hover:text-primary'}`} title="Chế độ Dễ Đọc (Dành cho mắt yếu)">
              <Eye size={20} />
            </button>
          </>
        )}
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
            disabled={ttsStatus === 'loading' || isPlayingGlobal}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-full font-bold shadow-md shadow-accent/20 hover:shadow-lg transition-all active:scale-95 disabled:opacity-70"
          >
            {ttsStatus === 'idle' && !isPlayingGlobal && <><Headphones size={20} /><span>Nghe Đọc Sách</span></>}
            {ttsStatus === 'loading' && <><Sparkles size={20} className="animate-pulse" /><span>Đang chuẩn bị...</span></>}
            {isPlayingGlobal && <><Mic size={20} className="animate-bounce" /><span>Đang phát nền</span></>}
          </button>
        )}
      </div>

      {finalPdfUrl ? (
        <div className="w-full h-[80vh] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
          <iframe src={finalPdfUrl} className="w-full h-full border-none"></iframe>
        </div>
      ) : (
        <div 
          onMouseUp={handleTextSelection}
          className={`leading-relaxed transition-all selection:bg-emerald-200 dark:selection:bg-emerald-900/50 ${
            viewMode === 'pages' 
              ? 'h-[75vh] overflow-x-auto overflow-y-hidden pb-8' 
              : ''
          } ${
            dyslexiaMode 
              ? 'font-sans tracking-[0.15em] leading-[2.5] bg-[#FFFDD0] text-[#111] p-6 md:p-10 rounded-3xl shadow-inner dark:bg-slate-900 dark:text-slate-100' 
              : 'text-ink'
          }`}
          style={{ 
            fontSize: fontSize + 'rem',
            columnWidth: viewMode === 'pages' ? '768px' : 'auto',
            columnGap: viewMode === 'pages' ? '4rem' : 'normal',
            maxWidth: '100%',
          }}
        >
          {book.content ? (
            <div dangerouslySetInnerHTML={{ __html: book.content.replace(/\n/g, '<br/>') }} className="snap-start" />
          ) : book.desc ? (
            <>
              <div className="bg-secondary/10 text-secondary italic p-4 border-l-4 border-secondary rounded-r-xl mb-6 font-semibold snap-start">
                Ghi chú: Đây chỉ là phần giới thiệu ngắn. Bản đọc chi tiết chưa được tải lên hệ thống.
              </div>
              <div dangerouslySetInnerHTML={{ __html: book.desc.replace(/\n/g, '<br/>') }} className="snap-start" />
            </>
          ) : (
            <p className="text-muted italic text-center py-10 snap-start">Nội dung văn bản chưa được cập nhật cho cuốn sách này.</p>
          )}
        </div>
      )}

      {dictWord && !isImmersive && (
        <div 
          className="absolute z-50 bg-white dark:bg-slate-800 text-ink p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-xs transform -translate-x-1/2 -translate-y-full mb-4 animate-in fade-in zoom-in-95"
          style={{ left: dictPos.x, top: dictPos.y }}
        >
          <div className="font-bold text-emerald-600 dark:text-emerald-400 mb-1 border-b border-slate-100 dark:border-slate-700 pb-1 flex items-center justify-between">
            <span>{dictWord}</span>
            <button onClick={() => setDictWord(null)} className="text-slate-400 hover:text-slate-600">×</button>
          </div>
          {dictLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted py-2">
              <BrainCircuit size={14} className="animate-pulse text-emerald-500" /> Đang tra từ điển...
            </div>
          ) : (
            <p className="text-sm leading-relaxed">{dictDef}</p>
          )}
          <div className="absolute w-3 h-3 bg-white dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 transform rotate-45 -bottom-1.5 left-1/2 -translate-x-1/2"></div>
        </div>
      )}

      <div ref={endMarkRef} className="h-4 mt-20"></div>

      {/* AI Chat Section */}
      <div className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-3xl p-6 md:p-8 shadow-sm border border-indigo-100 dark:border-indigo-900/50">
        <h2 className="text-2xl font-serif font-extrabold flex items-center gap-2 mb-6 text-indigo-700 dark:text-indigo-400">
          <Feather size={28} className="text-indigo-600 dark:text-indigo-400" /> Góc Trò Chuyện Cùng Tác Giả
        </h2>
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-inner mb-4 overflow-hidden border border-slate-100 dark:border-slate-800">
          <div className="h-[300px] overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 opacity-70">
                <Feather size={48} className="opacity-50 mb-2" />
                <p>Hãy hỏi tôi bất kỳ điều gì về cuốn sách này!</p>
                <p className="text-sm text-center px-4">VD: "Chào tác giả, điều gì đã truyền cảm hứng để tác giả viết cuốn sách này?"</p>
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
      {/* AI Quiz Section */}
      {showGamification && (
        <div className="mt-8 bg-gradient-to-tr from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-3xl p-6 md:p-8 shadow-sm border border-emerald-100 dark:border-emerald-900/50">
          <h2 className="text-2xl font-serif font-extrabold flex items-center gap-2 mb-6 text-emerald-700 dark:text-emerald-400">
            <BrainCircuit size={28} className="text-emerald-600 dark:text-emerald-400" /> Thử Thách Trí Tuệ
          </h2>
          
          {!quizData && !isQuizLoading && (
            <div className="text-center py-6">
              <p className="text-emerald-800/80 dark:text-emerald-200/80 mb-4 font-medium">Bạn đã hoàn thành cuốn sách! Hệ thống sẽ tự động tạo ra 3 câu hỏi để kiểm tra trí nhớ của bạn và nhận thêm Điểm thưởng (XP) nhé!</p>
              <button 
                onClick={handleGenerateQuiz}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-full transition-transform active:scale-95 shadow-md"
              >
                Bắt đầu bài kiểm tra
              </button>
            </div>
          )}

          {isQuizLoading && (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {quizData && (
            <div className="space-y-6">
              {quizData.map((q, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <p className="font-bold text-ink mb-4">{i + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = quizAnswers[i] === optIdx;
                      let optionClass = "w-full text-left p-3 rounded-xl border transition-colors ";
                      
                      if (showQuizResult) {
                        if (optIdx === q.correctIndex) {
                          optionClass += "bg-emerald-100 border-emerald-500 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
                        } else if (isSelected) {
                          optionClass += "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/40 dark:text-red-200";
                        } else {
                          optionClass += "border-slate-200 dark:border-slate-700 opacity-50";
                        }
                      } else {
                        optionClass += isSelected 
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-500" 
                          : "border-slate-200 hover:border-emerald-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-ink";
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={showQuizResult}
                          onClick={() => setQuizAnswers(prev => ({...prev, [i]: optIdx}))}
                          className={optionClass}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {!showQuizResult ? (
                <button
                  onClick={submitQuiz}
                  disabled={Object.keys(quizAnswers).length < quizData.length}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Nộp bài
                </button>
              ) : (
                <div className="text-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <p className="text-xl font-bold mb-2">Bạn trả lời đúng {quizScore}/{quizData.length} câu!</p>
                  {quizScore > 0 && <p className="text-emerald-600 font-bold">+ {quizScore * 10} Phút XP vào Cây Tri Thức</p>}
                  <button 
                    onClick={handleGenerateQuiz}
                    className="mt-4 px-6 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-full font-bold transition-colors"
                  >
                    Thử bộ câu hỏi khác
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* AI Mindmap Section */}
      <div className="mt-8 bg-gradient-to-tr from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 rounded-3xl p-6 md:p-8 shadow-sm border border-sky-100 dark:border-sky-900/50">
        <h2 className="text-2xl font-serif font-extrabold flex items-center gap-2 mb-6 text-sky-700 dark:text-sky-400">
          <Network size={28} className="text-sky-600 dark:text-sky-400" /> Sơ Đồ Tư Duy Tóm Tắt
        </h2>
        
        {!mindmapCode && !isMindmapLoading && (
          <div className="text-center py-6">
            <p className="text-sky-800/80 dark:text-sky-200/80 mb-4 font-medium">Bạn muốn tổng hợp nhanh kiến thức cuốn sách này? Hệ thống sẽ tự động vẽ Sơ đồ tư duy cho bạn nhé!</p>
            <button 
              onClick={handleGenerateMindmap}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-full transition-transform active:scale-95 shadow-md"
            >
              Vẽ Sơ Đồ Tư Duy
            </button>
          </div>
        )}

        {isMindmapLoading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {mindmapCode && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-sky-200 dark:border-sky-800 shadow-sm overflow-hidden">
            <Mermaid chart={mindmapCode} />
          </div>
        )}
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
