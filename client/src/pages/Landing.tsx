import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTrending, imgUrl } from '../api/tmdb';
import { Film, Eye, Star, Heart, Activity } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [backdropMovies, setBackdropMovies] = useState<any[]>([]);

  // Fetch movies just to get a nice background collage
  useEffect(() => {
    const loadBackgrounds = async () => {
      try {
        const movies = await fetchTrending();
        setBackdropMovies(movies.slice(0, 6)); // Get top 6 for the grid
      } catch (e) { console.error(e); }
    };
    loadBackgrounds();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1014] text-white flex flex-col font-sans">
      
      {/* 1. NAVBAR (Landing Version) */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full z-50">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-wider">
          <Film className="text-purple-500 w-8 h-8" />
          <span>FILMHIVE</span>
        </div>
        <div className="flex items-center gap-6 font-bold text-sm uppercase tracking-wide">
            <button onClick={() => navigate('/login')} className="hover:text-purple-400 transition">Sign In</button>
            <button onClick={() => navigate('/login')} className="bg-white text-black px-5 py-2 rounded-full hover:bg-gray-200 transition">
                Create Account
            </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <div className="relative flex-1 flex flex-col justify-center items-center text-center px-6 mt-10 mb-20">
        
        {/* Dark Overlay Gradient over a static collage (optional) */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-20 pointer-events-none mask-image-gradient">
            <div className="grid grid-cols-3 gap-4 rotate-6 scale-110">
                {backdropMovies.map(movie => (
                    <img key={movie.id} src={imgUrl(movie.poster_path)} className="rounded-xl w-full object-cover" alt="" />
                ))}
            </div>
            <div className="absolute inset-0 bg-[#0f1014]/90"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                Track films you’ve watched.<br/>
                <span className="text-gray-500">Save those you want to see.</span><br/>
                <span className="text-purple-500">Tell your friends what’s good.</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto pt-4">
                The social network for film lovers. Keep a diary of your life in movies.
            </p>

            <button 
                onClick={() => navigate('/login')}
                className="mt-8 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold py-4 px-10 rounded-full transition shadow-lg shadow-purple-600/30 transform hover:scale-105"
            >
                Get Started — It's Free!
            </button>
        </div>
      </div>

      {/* 3. FEATURES GRID (The Letterboxd "3 Columns") */}
      <div className="bg-[#1a1b26] py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-2">
                    <Eye size={32} />
                </div>
                <h3 className="text-xl font-bold">Keep track of every film you've ever watched</h3>
                <p className="text-gray-400 leading-relaxed">
                    Log every movie as you watch it to create a diary of your film life.
                </p>
            </div>

            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-400 mb-2">
                    <Heart size={32} />
                </div>
                <h3 className="text-xl font-bold">Show some love for your favorite films</h3>
                <p className="text-gray-400 leading-relaxed">
                    Rate, review, and tag films as you add them to your profile.
                </p>
            </div>

            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-2">
                    <Activity size={32} />
                </div>
                <h3 className="text-xl font-bold">Compile and share lists of films on any topic</h3>
                <p className="text-gray-400 leading-relaxed">
                    Create lists of your favorite movies to share with friends.
                </p>
            </div>

        </div>
      </div>

      {/* 4. FOOTER */}
      <footer className="py-12 text-center text-sm text-gray-500">
        <div className="flex justify-center gap-6 mb-4">
            <a href="#" className="hover:text-white">About</a>
            <a href="#" className="hover:text-white">News</a>
            <a href="#" className="hover:text-white">Pro</a>
            <a href="#" className="hover:text-white">Apps</a>
            <a href="#" className="hover:text-white">Help</a>
        </div>
        <p>© 2024 FilmHive. Made for film lovers.</p>
        <p className="mt-2 text-xs opacity-50">Film data from TMDb.</p>
      </footer>

    </div>
  );
};

export default Landing;