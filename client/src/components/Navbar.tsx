import React, { useState } from 'react';
import { Search, Bell, User as UserIcon, LogOut, Film } from 'lucide-react';
import { useAuth } from '../state/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  
  // NEW: Search State
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
        navigate(`/search?q=${searchTerm}`);
    }
  };
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-[#1a1b26] text-white sticky top-0 z-50 shadow-md">
      {/* Logo */}
      <div 
        className="flex items-center gap-2 font-bold text-xl tracking-wider cursor-pointer"
        onClick={() => navigate('/')}
      >
        <Film className="text-purple-500" />
        <span>FILMHIVE</span>
      </div>

      {/* Center Links (Hidden on mobile) */}
      <div className="hidden md:flex gap-8 text-sm text-gray-400 font-medium">
        <button onClick={() => navigate('/')} className="hover:text-white transition">Home</button>
        <button className="hover:text-white transition">Movies</button>
        <button className="hover:text-white transition">TV Shows</button>
        <button className="hover:text-white transition">My List</button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="hidden md:flex relative bg-[#2e3048] rounded-full px-4 py-2 items-center gap-2 w-64 focus-within:ring-2 ring-purple-500 transition">
          <Search size={16} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search hive..." 
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        {user ? (
          <>
            {/* Logged In State */}
            <div className="p-2 bg-[#2e3048] rounded-full hover:bg-purple-600 transition cursor-pointer">
                <Bell size={18} />
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <div 
  onClick={() => navigate('/profile')} // <--- CHANGED FROM DROPDOWN TO NAVIGATE
  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
>
  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center font-bold text-xs uppercase">
      {user.username ? user.username[0] : 'U'}
  </div>
</div>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1a1b26] border border-gray-700 rounded-xl shadow-xl overflow-hidden py-1">
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm text-white font-bold">{user.username}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={logout}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Logged Out State */
          <button 
            onClick={() => navigate('/login')}
            className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-full font-bold text-sm transition"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;