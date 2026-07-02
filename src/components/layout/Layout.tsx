import React from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Outlet } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Layout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 max-w-full pb-24 md:pb-8 relative">
        <button 
          className="md:hidden fixed top-4 right-4 bg-surface rounded-full w-11 h-11 flex items-center justify-center shadow-md z-40 text-muted hover:text-primary"
          onClick={() => navigate('/admin')}
        >
          <Settings size={22} />
        </button>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
