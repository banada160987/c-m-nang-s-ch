import React from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const Profile: React.FC = () => {
  const { stats, dailyStats } = useAppContext();
  const m = stats.minutes;
  let nextLevelMins = 0;
  let treeVisual = '🌱';
  let treeLevel = 'Mầm Non';
  
  if (m < 30) {
    treeVisual = '🌱';
    treeLevel = 'Mầm Non';
    nextLevelMins = 30;
  } else if (m < 120) {
    treeVisual = '🌿';
    treeLevel = 'Cây Non';
    nextLevelMins = 120;
  } else if (m < 500) {
    treeVisual = '🌳';
    treeLevel = 'Cây Xanh Tốt';
    nextLevelMins = 500;
  } else {
    treeVisual = '🌲✨';
    treeLevel = 'Cây Cổ Thụ Tri Thức';
    nextLevelMins = m; // Max level
  }
  
  const percent = nextLevelMins > m ? (m / nextLevelMins) * 100 : 100;

  // Prepare chart data (last 7 days)
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const displayDate = `${d.getDate()}/${d.getMonth()+1}`;
    chartData.push({
      name: displayDate,
      minutes: dailyStats[dateStr] || 0
    });
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="text-center py-10 relative">
        <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-primary mb-4">Hồ Sơ & Thành Tựu</h1>
        <p className="text-lg text-muted italic">Hành trình nuôi dưỡng Cây Tri Thức</p>
      </div>

      <div className="text-center mt-4">
        <div className="text-[6rem] mb-6 drop-shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
          {treeVisual}
        </div>
        <h3 className="text-2xl font-bold text-primary mb-4">{treeLevel}</h3>
        
        <div className="w-full max-w-md mx-auto bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden mb-4 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out rounded-full"
            style={{ width: percent + '%' }}
          />
        </div>
        
        {nextLevelMins > m ? (
          <p className="text-muted text-lg">Đọc thêm <strong className="text-ink text-xl">{nextLevelMins - m}</strong> phút để cây lớn lên!</p>
        ) : (
          <p className="text-primary font-bold text-lg">Bạn đã đạt cấp độ cao nhất!</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-2xl mx-auto">
        <div className="bg-surface p-8 rounded-3xl text-center border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4">⏱️</div>
          <div className="text-4xl font-extrabold text-ink mb-1">{stats.minutes}</div>
          <div className="text-muted font-bold">Tổng Số Phút Đã Đọc</div>
        </div>
        <div className="bg-surface p-8 rounded-3xl text-center border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4">📚</div>
          <div className="text-4xl font-extrabold text-ink mb-1">{stats.books}</div>
          <div className="text-muted font-bold">Sách Đã Hoàn Thành</div>
        </div>
      </div>

      <div className="mt-12 max-w-3xl mx-auto bg-surface p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-ink">Thống kê 7 ngày qua</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}p`} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="minutes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
