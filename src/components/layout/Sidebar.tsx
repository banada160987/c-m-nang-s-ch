import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Lightbulb, Heart, User, Settings, HelpCircle, Trophy } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { getTreeLevelInfo } from '../../utils/gamification';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { stats } = useAppContext();
  const treeInfo = getTreeLevelInfo(stats.minutes);

  const links = [
    { to: '/', label: 'Kho Sách', icon: <Home size={20} /> },
    { to: '/suggestions', label: 'Cẩm Nang', icon: <Lightbulb size={20} /> },
    { to: '/leaderboard', label: 'Thi Đua', icon: <Trophy size={20} /> },
    { to: '/favorites', label: 'Yêu Thích', icon: <Heart size={20} /> },
    { to: '/profile', label: 'Hồ Sơ', icon: <User size={20} /> },
    { to: '/guide', label: 'Hướng Dẫn', icon: <HelpCircle size={20} /> },
    { to: '/admin', label: 'Cài Đặt', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 bg-surface border-r border-slate-200 dark:border-slate-700 p-6 sticky top-0 h-screen z-50 overflow-y-auto">
      <div className="font-serif text-3xl font-extrabold text-primary mb-8 flex items-center gap-3">
        <span className="text-4xl animate-bounce" style={{ animationDuration: '3s' }}>📚</span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Cẩm Nang Sách</span>
      </div>

      {/* Gamification Widget */}
      <div 
        onClick={() => navigate('/profile')}
        className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-4 rounded-2xl mb-8 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all group"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="text-4xl group-hover:scale-110 transition-transform">{treeInfo.icon}</div>
          <div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Cây của bạn</div>
            <div className="font-bold text-ink text-lg">{treeInfo.name}</div>
          </div>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
            style={{ width: treeInfo.percent + '%' }}
          />
        </div>
        <div className="text-right mt-1 text-xs font-semibold text-muted">
          {treeInfo.isMax ? 'Cấp tối đa!' : `${stats.minutes} / ${treeInfo.nextLevelMins} phút`}
        </div>
      </div>

      <nav className="flex flex-col gap-3 flex-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `
              flex items-center gap-4 px-5 py-3 rounded-xl font-bold transition-all text-lg
              ${isActive 
                ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                : 'text-muted hover:bg-primary/10 hover:text-primary bg-transparent'
              }
            `}
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>
      <button 
        onClick={() => navigate('/admin')}
        className="mt-auto flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-bold text-muted hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Settings size={20} />
        Quản trị
      </button>
    </aside>
  );
};
