import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './state/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Landing from './pages/Landing';
import MovieDetails from './pages/MovieDetails';
import ActorDetails from './pages/ActorDetails';
import Profile from './pages/Profile';
import SearchResults from './pages/SearchResults'; // <--- IMPORT THIS
import TVDetails from './pages/TVDetails';
import Connections from './pages/Connections';
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex h-screen items-center justify-center bg-[#0f1014] text-white">
    <h1 className="text-3xl font-bold text-gray-500">{title} Coming Soon</h1>
  </div>
);

const App = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0f1014] text-white">
      <Routes>
        <Route path="/" element={user ? <Home /> : <Landing />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/person/:id" element={<ActorDetails />} />
        
        {/* UPDATED: Profile handles both /profile (self) and /profile/:id (others) */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/profile/:id/history" element={<History />} />
        {/* NEW SEARCH ROUTE */}
        <Route path="/search" element={<SearchResults />} /> 
        <Route path="/tv/:id" element={<TVDetails />} />
        <Route path="/profile/:id/connections" element={<Connections />} />
        <Route path="/movies" element={<Placeholder title="Movies & TV" />} />
        <Route path="/news" element={<Placeholder title="News Feed" />} />
        <Route path="/watchlist" element={<Placeholder title="Watchlist" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;