import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  email: string;
  token: string;
  watchlist: any[]; // We include the watchlist here now
}

interface AuthContextType {
  user: User | null;
  login: (formData: any) => Promise<void>;
  register: (formData: any) => Promise<void>;
  logout: () => void;
  toggleWatchlist: (movie: any) => Promise<void>; // New global function
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // 1. Load User & Fetch latest Profile (to get up-to-date watchlist)
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('filmhive_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        try {
            // Fetch fresh data from DB to ensure watchlist is synced
            const { data } = await axios.get(`http://localhost:5000/api/users/${parsedUser._id}`);
            setUser({ ...parsedUser, watchlist: data.watchlist }); 
        } catch (error) {
            setUser(parsedUser); // Fallback to local storage if API fails
        }
      }
    };
    initAuth();
  }, []);

  const login = async (formData: any) => {
    const { data } = await axios.post('http://localhost:5000/api/auth/login', formData);
    setUser({ ...data, watchlist: data.watchlist || [] }); // Ensure watchlist exists
    localStorage.setItem('filmhive_user', JSON.stringify(data));
  };

  const register = async (formData: any) => {
    const { data } = await axios.post('http://localhost:5000/api/auth/register', formData);
    setUser(data);
    localStorage.setItem('filmhive_user', JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('filmhive_user');
    window.location.href = '/login';
  };

  // 2. The Smart Toggle Function
  const toggleWatchlist = async (movie: any) => {
    if (!user) {
        alert("Please login to use the watchlist.");
        return;
    }

    // Check if movie is already in watchlist
    const exists = user.watchlist?.find((m: any) => m.movieId === movie.id.toString());
    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    try {
        let updatedWatchlist;
        
        if (exists) {
            // REMOVE
            const { data } = await axios.delete(`http://localhost:5000/api/users/watchlist/${movie.id}`, config);
            updatedWatchlist = data;
        } else {
            // ADD
            const { data } = await axios.post('http://localhost:5000/api/users/watchlist', {
                movieId: movie.id,
                title: movie.title,
                posterPath: movie.poster_path
            }, config);
            updatedWatchlist = data;
        }

        // Update State instantly so UI reflects change
        const updatedUser = { ...user, watchlist: updatedWatchlist };
        setUser(updatedUser);
        // We don't save full list to localStorage to keep it light, but in this session it works.

    } catch (error) {
        console.error("Watchlist error", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, toggleWatchlist }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};