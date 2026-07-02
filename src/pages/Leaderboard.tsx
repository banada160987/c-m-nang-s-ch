import React, { useEffect, useState } from 'react';
import { getLeaderboard, LeaderboardEntry } from '../services/leaderboardService';
import { useAppContext } from '../context/AppContext';
import { Trophy, Medal, Crown } from 'lucide-react';
import { getTreeLevelInfo } from '../utils/gamification';

export const Leaderboard: React.FC = () => {
  const { userName, setUserName, stats } = useAppContext();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputName, setInputName] = useState(userName);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await getLeaderboard();
      setEntries(data);
      setLoading(false);
    };
    fetchLeaderboard();
  }, [userName]); // Refetch when username changes (syncs)

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      setUserName(inputName.trim());
    }
  };

  const renderRankIcon = (index: number) => {
    if (index === 0) return <Crown className="text-yellow-500 w-8 h-8 drop-shadow-md" />;
    if (index === 1) return <Medal className="text-slate-400 w-8 h-8 drop-shadow-md" />;
    if (index === 2) return <Medal className="text-amber-600 w-8 h-8 drop-shadow-md" />;
    return <span className="font-bold text-xl text-muted w-8 text-center">{index + 1}</span>;
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="text-center py-10 relative">
        <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '3s' }}>🏆</div>
        <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-primary mb-4 drop-shadow-sm">
          Bảng Vàng Thi Đua
        </h1>
        <p className="text-lg text-muted font-semibold max-w-xl mx-auto">
          Cùng vinh danh những bạn học sinh chăm chỉ đọc sách và có "Cây Tri Thức" to lớn nhất trường!
        </p>
      </div>

      {!userName && (
        <div className="bg-gradient-to-r from-secondary to-orange-400 rounded-3xl p-6 md:p-8 mb-10 text-white shadow-xl shadow-secondary/20">
          <h2 className="text-2xl font-bold mb-2">Ghi danh lên Bảng Vàng! ✍️</h2>
          <p className="mb-6 font-semibold opacity-90">Bạn chưa nhập tên. Hãy nhập biệt danh hoặc tên lớp để hệ thống vinh danh bạn nhé!</p>
          <form onSubmit={handleSaveName} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              value={inputName}
              onChange={e => setInputName(e.target.value)}
              placeholder="VD: Tuấn Kiệt - 9A1..." 
              required
              maxLength={25}
              className="flex-1 px-5 py-3 rounded-xl text-ink font-bold outline-none border-2 border-transparent focus:border-white/50 bg-white/90 focus:bg-white transition-all"
            />
            <button type="submit" className="bg-ink text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:scale-105 transition-all">
              Xác Nhận
            </button>
          </form>
        </div>
      )}

      {userName && stats.minutes === 0 && (
        <div className="bg-surface rounded-2xl p-6 text-center border-2 border-slate-200 dark:border-slate-700 mb-8 text-muted font-semibold">
          Xin chào <strong>{userName}</strong>! Cây của bạn vẫn là hạt giống. Hãy đọc sách để tích lũy phút và leo lên Bảng Xếp Hạng nhé!
        </div>
      )}

      <div className="bg-surface rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative min-h-[300px]">
        {loading ? (
           <div className="flex justify-center items-center h-40">
             <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-primary"></div>
           </div>
        ) : entries.length === 0 ? (
          <div className="p-10 text-center text-muted font-semibold">
            Chưa có ai trên Bảng Xếp Hạng. Hãy là người đầu tiên!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {entries.map((entry, index) => {
              const treeInfo = getTreeLevelInfo(entry.minutesRead);
              const isCurrentUser = entry.name === userName;
              
              return (
                <div 
                  key={entry.id} 
                  className={`p-4 md:p-6 flex items-center gap-4 md:gap-6 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50
                    ${isCurrentUser ? 'bg-primary/5 dark:bg-primary/10' : ''}
                  `}
                >
                  <div className="flex items-center justify-center shrink-0 w-10">
                    {renderRankIcon(index)}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                      {treeInfo.icon}
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg truncate ${isCurrentUser ? 'text-primary' : 'text-ink'}`}>
                        {entry.name}
                        {isCurrentUser && <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Bạn</span>}
                      </h3>
                      <p className="text-muted text-sm font-semibold truncate">Cấp độ: {treeInfo.name}</p>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-xl text-accent">{entry.minutesRead}</div>
                    <div className="text-xs text-muted font-bold uppercase tracking-wider">phút đọc</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
