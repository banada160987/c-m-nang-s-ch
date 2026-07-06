import React, { useRef, useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Play, Pause, X } from 'lucide-react';

export const GlobalAudioPlayer: React.FC = () => {
  const { globalAudio, setGlobalAudio } = useAppContext();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (globalAudio.url && audioRef.current) {
      audioRef.current.play().catch(e => console.error(e));
      setIsPlaying(true);
    }
  }, [globalAudio.url]);

  if (!globalAudio.url) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error(e));
    }
    setIsPlaying(!isPlaying);
  };

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setGlobalAudio({ url: null, title: '', bookId: '' });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-full pointer-events-none">
      <div className="max-w-md mx-auto bg-surface/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-4 flex items-center gap-4 pointer-events-auto">
        <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center shrink-0">
          <span className="text-2xl">🎧</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-xs text-primary font-bold uppercase tracking-wider mb-0.5">Đang phát</p>
          <p className="text-ink font-bold truncate">{globalAudio.title}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={togglePlay}
            className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>
          
          <button 
            onClick={closePlayer}
            className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <audio 
          ref={audioRef} 
          src={globalAudio.url} 
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
      </div>
    </div>
  );
};
