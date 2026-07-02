import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Suggestions } from './pages/Suggestions';
import { Favorites } from './pages/Favorites';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Reader } from './pages/Reader';
import { Guide } from './pages/Guide';
import { Leaderboard } from './pages/Leaderboard';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/suggestions" element={<Suggestions />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/guide" element={<Guide />} />
          </Route>
          <Route path="/reader/:id" element={<Reader />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
