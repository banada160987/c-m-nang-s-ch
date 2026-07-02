import { Home, Lightbulb, Heart, User, HelpCircle, Trophy } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const BottomNav: React.FC = () => {
  const links = [
    { to: '/', icon: <Home size={24} />, label: 'Sách' },
    { to: '/suggestions', icon: <Lightbulb size={24} />, label: 'Gợi ý' },
    { to: '/leaderboard', icon: <Trophy size={24} />, label: 'Thi đua' },
    { to: '/favorites', icon: <Heart size={24} />, label: 'Tủ sách' },
    { to: '/profile', icon: <User size={24} />, label: 'Hồ sơ' },
  ];

  return (
    <nav className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md flex gap-2 p-2 rounded-full shadow-2xl z-50 border border-white/50 dark:border-white/10">
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `
            p-3 rounded-full flex items-center justify-center transition-all ripple
            ${isActive ? 'bg-primary text-white' : 'text-muted bg-transparent'}
          `}
        >
          {link.icon}
        </NavLink>
      ))}
    </nav>
  );
};
