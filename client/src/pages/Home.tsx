import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { fetchTrending, fetchTopRated, imgUrl } from '../api/tmdb';
import { Play, Plus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';

const Home = () => {
  const { user, toggleWatchlist } = useAuth();
  const navigate = useNavigate();
  
  const [heroMovie, setHeroMovie] = useState<any>(null);
  const [recommended, setRecommended] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
        try {
            const trending = await fetchTrending();
            const topRated = await fetchTopRated();
            
            if (trending && trending.length > 0) setHeroMovie(trending[0]);
            if (topRated) setRecommended(topRated);
        } catch (e) { 
            console.error("Failed to load home data", e); 
        }
    };
    loadData();
  }, []);

  if (!heroMovie) return <div className="text-white text-center mt-20">Loading FilmHive...</div>;

  // Check if the current Hero movie is inside the user's watchlist
  const isInWatchlist = user?.watchlist?.some((m: any) => m.movieId === heroMovie.id.toString());

  // Helper for genre names
  const getGenreName = (id: number) => {
    const genres: Record<number, string> = { 28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller', 10752: 'War', 37: 'Western' };
    return genres[id] || 'Movie';
  };

  return (
    <div className="min-h-screen bg-[#0f1014] text-white font-sans pb-20">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-6 mt-6">
        
        {/* HERO SECTION */}
        <div className="relative w-full h-[550px] rounded-3xl overflow-hidden shadow-2xl group">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${imgUrl(heroMovie.backdrop_path)})` }}
          >
             {/* Gradient Overlays */}
             <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-transparent to-black/30"></div>
             <div className="absolute inset-0 bg-gradient-to-r from-[#0f1014]/80 via-transparent to-transparent"></div>
          </div>
          
          {/* Content Wrapper */}
          <div className="relative z-10 h-full flex flex-col justify-between p-12">
            
            {/* Top Left: Title & Overview */}
             <div className="max-w-2xl mt-auto mb-12">
                <h1 
                    className="text-6xl font-bold mb-4 leading-tight drop-shadow-lg cursor-pointer hover:text-purple-400 transition" 
                    onClick={() => navigate(`/movie/${heroMovie.id}`)}
                >
                    {heroMovie.title}
                </h1>
                <p className="text-gray-300 line-clamp-3 text-sm leading-relaxed max-w-lg drop-shadow-md">
                    {heroMovie.overview}
                </p>
            </div>

            {/* Bottom Bar Container */}
            <div className="flex items-end justify-between w-full mt-4">
                
                {/* Bottom Left: Genre Tags */}
                 <div className="flex gap-2">
                    {heroMovie.genre_ids.slice(0, 3).map((id: number) => (
                        <span key={id} className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-xs font-medium hover:bg-white/20 transition cursor-default">
                            {getGenreName(id)}
                        </span>
                    ))}
                    <span className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-xs font-medium">
                        {heroMovie.release_date?.split('-')[0]}
                    </span>
                </div>

                {/* Bottom Right: Rating & Buttons */}
                <div className="flex flex-col items-end gap-3">
                    {/* Rating Number */}
                    <div className="text-4xl font-bold text-white drop-shadow-md mr-2">
                        {heroMovie.vote_average.toFixed(1)} <span className="text-lg text-yellow-500">★</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button 
                            onClick={() => navigate(`/movie/${heroMovie.id}`)}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-full font-bold text-sm transition shadow-lg shadow-purple-600/30"
                        >
                            <Play size={16} fill="currentColor" /> Watch Now
                        </button>
                        
                        {/* SMART WATCHLIST BUTTON */}
                        <button 
                            onClick={() => toggleWatchlist(heroMovie)}
                            className={`flex items-center gap-2 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full font-bold text-sm transition
                            ${isInWatchlist 
                                ? 'bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30' 
                                : 'bg-white/10 hover:bg-white/20'}`}
                        >
                            {isInWatchlist ? <Check size={16} /> : <Plus size={16} />} 
                            {isInWatchlist ? 'In Watchlist' : 'Watchlist'}
                        </button>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* RECOMMENDED SECTION */}
        <div className="mt-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold tracking-wide">RECOMMENDED</h2>
            <div className="flex gap-2 text-xs text-gray-400 cursor-pointer hover:text-white transition">
               <span>Show All</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {recommended.slice(0, 12).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>

        {/* RECENTLY WATCHED (Mockup for Visual Completeness) */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold tracking-wide mb-6">RECENTLY WATCHED</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
             {/* Using the first 3 recommended movies as mock recent watches */}
             {recommended.slice(0, 3).map(movie => (
                <div key={movie.id} onClick={() => navigate(`/movie/${movie.id}`)} className="bg-[#1a1b26] rounded-xl overflow-hidden flex hover:ring-2 ring-purple-500 transition cursor-pointer h-28">
                    <img src={imgUrl(movie.backdrop_path, 'w500')} className="w-40 h-full object-cover" alt={movie.title} />
                    <div className="p-4 flex flex-col justify-center w-full">
                        <h4 className="font-bold text-sm mb-1 truncate">{movie.title}</h4>
                        <span className="text-xs text-gray-500">Watched just now</span>
                        <div className="w-full bg-gray-700 h-1 mt-3 rounded-full overflow-hidden">
                            <div className="bg-purple-500 w-full h-full"></div>
                        </div>
                    </div>
                </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;