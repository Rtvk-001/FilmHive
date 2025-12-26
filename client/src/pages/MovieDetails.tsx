import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchMovieDetails, imgUrl } from '../api/tmdb';
import { Play, Plus, Clock, Calendar, Star, Check, X } from 'lucide-react';
import { useAuth } from '../state/AuthContext';
import axios from 'axios';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, toggleWatchlist } = useAuth(); // Use Global Toggle
  const [movie, setMovie] = useState<any>(null);

  useEffect(() => {
    const loadMovie = async () => {
      if (id) {
        try {
          const data = await fetchMovieDetails(id);
          setMovie(data);
        } catch (error) {
          console.error("Failed to fetch details", error);
        }
      }
    };
    loadMovie();
  }, [id]);

  if (!movie) return <div className="text-white text-center mt-20">Loading Details...</div>;

  // Check if movie is in watchlist (safely check if user & watchlist exist)
  const isInWatchlist = user?.watchlist?.some((m: any) => m.movieId === movie.id.toString());

  // Extract Director
  const director = movie.credits?.crew?.find((person: any) => person.job === 'Director')?.name || 'Unknown';
  
  // Extract Certification (US)
  const certification = movie.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US')?.release_dates[0]?.certification || 'N/A';

  // --- WATCH PROVIDERS LOGIC (US Focus) ---
  const watchProviders = movie['watch/providers']?.results?.US;
  
  // Prioritize "Flatrate" (Streaming), then "Rent", then "Buy"
  const streamProviders = watchProviders?.flatrate || [];
  const rentProviders = watchProviders?.rent || [];
  const buyProviders = watchProviders?.buy || [];

  // Decide what to show: Stream > Rent > Buy
  const activeProviders = streamProviders.length > 0 ? streamProviders : (rentProviders.length > 0 ? rentProviders : buyProviders);
  const providerLabel = streamProviders.length > 0 ? "Stream On" : (rentProviders.length > 0 ? "Rent On" : "Buy On");
  const markAsSeen = async () => {
    if (!user) return navigate('/login');
    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.post('http://localhost:5000/api/users/seen/movie', {
            movieId: movie.id,
            title: movie.title,
            posterPath: movie.poster_path,
            runtime: movie.runtime
        }, config);
        alert("Marked as Seen!");
        // Optional: Force reload or update local state to hide button/show checkmark
    } catch (error: any) {
        alert(error.response?.data?.message || "Error marking as seen");
    }
};
  return (
    <div className="min-h-screen bg-[#0f1014] text-white font-sans pb-20">
      <Navbar />

      {/* TOP BACKDROP BANNER */}
      <div className="relative w-full h-[400px] overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-top"
            style={{ backgroundImage: `url(${imgUrl(movie.backdrop_path)})` }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f1014]/60 to-[#0f1014]"></div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12">
            
            {/* LEFT COLUMN (Poster & Sidebar Info) */}
            <div className="space-y-6">
                <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                    <img src={imgUrl(movie.poster_path)} alt={movie.title} className="w-full" />
                </div>
                
                {/* SMART WATCHLIST BUTTON */}
                <button 
                    onClick={() => toggleWatchlist(movie)}
                    className={`w-full py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition 
                    ${isInWatchlist 
                        ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20' 
                        : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                    {isInWatchlist ? <X size={18} /> : <Plus size={18} />} 
                    {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </button>

                {/* ACTION BUTTONS ROW */}
                <div className="flex gap-2">
                    <button 
                        onClick={markAsSeen}
                        className="flex-1 bg-[#1a1b26] py-2 rounded-lg text-sm font-medium hover:bg-[#2e3048] transition flex items-center justify-center gap-1"
                    >
                        <Check size={14} /> Seen
                    </button>
                    <button className="flex-1 bg-[#1a1b26] py-2 rounded-lg text-sm font-medium hover:bg-[#2e3048] transition flex items-center justify-center gap-1">
                        <Star size={14} /> Like
                    </button>
                </div>

                {/* Sidebar Stats */}
                <div className="bg-[#1a1b26] p-5 rounded-xl space-y-4 text-sm text-gray-400">
                    <div>
                        <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Rating</span>
                        <div className="flex items-center gap-2 text-white font-bold text-lg">
                            <Star size={16} className="text-yellow-500" fill="currentColor"/> {movie.vote_average.toFixed(1)} <span className="text-xs text-gray-500 font-normal">/ 10</span>
                        </div>
                    </div>
                    <div>
                        <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Age Rating</span>
                        <span className="text-white border border-gray-600 px-2 py-0.5 rounded text-xs">{certification}</span>
                    </div>
                    <div>
                        <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Director</span>
                        <span className="text-white">{director}</span>
                    </div>
                    <div>
                        <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Release Date</span>
                        <span className="text-white">{movie.release_date}</span>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN (Main Info) */}
            <div className="pt-8">
                <h1 className="text-5xl font-bold mb-4">{movie.title}</h1>
                
                {/* Meta Row */}
                <div className="flex flex-wrap items-center gap-4 mb-8 text-sm">
                    <div className="flex gap-2">
                        {movie.genres.map((g: any) => (
                            <span key={g.id} className="border border-gray-600 px-3 py-1 rounded-full text-xs hover:bg-white/10 cursor-default">
                                {g.name}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                        <Calendar size={14}/> {movie.release_date.split('-')[0]}
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                        <Clock size={14}/> {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                    </div>
                </div>

                {/* WHERE TO WATCH SECTION */}
                <div className="bg-white text-black rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2 uppercase tracking-wide">{providerLabel}</h3>
                        
                        {activeProviders.length > 0 ? (
                            <div className="flex flex-wrap gap-4">
                                {activeProviders.map((provider: any) => (
                                    <div key={provider.provider_id} className="flex items-center gap-2 bg-gray-100 pr-3 rounded-full overflow-hidden border border-gray-200">
                                        <img 
                                            src={imgUrl(provider.logo_path, 'w92')} 
                                            alt={provider.provider_name} 
                                            className="w-8 h-8 object-cover"
                                        />
                                        <span className="text-sm font-semibold text-gray-800">{provider.provider_name}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span className="text-sm text-gray-500">Currently not available to stream in US</span>
                        )}
                    </div>
                    
                    {watchProviders?.link && (
                         <a href={watchProviders.link} target="_blank" rel="noreferrer" className="bg-black text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-800 shrink-0">
                            Check All
                        </a>
                    )}
                </div>

                {/* Movie Info */}
                <div className="mb-10">
                    <h3 className="text-xl font-bold mb-4 uppercase text-gray-300">Movie Info</h3>
                    <p className="text-gray-300 leading-relaxed text-lg">
                        {movie.overview}
                    </p>
                </div>

                {/* Top Cast */}
                <div>
                    <h3 className="text-xl font-bold mb-6 uppercase text-gray-300">Top Cast</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {movie.credits?.cast?.slice(0, 8).map((actor: any) => (
                            <div 
                                key={actor.id} 
                                onClick={() => navigate(`/person/${actor.id}`)}
                                className="bg-[#1a1b26] p-3 rounded-xl flex items-center gap-3 hover:bg-[#2e3048] transition cursor-pointer group"
                            >
                                <img 
                                    src={actor.profile_path ? imgUrl(actor.profile_path, 'w200') : 'https://via.placeholder.com/50'} 
                                    className="w-12 h-12 rounded-full object-cover group-hover:ring-2 ring-purple-500 transition" 
                                    alt={actor.name}
                                />
                                <div className="overflow-hidden">
                                    <h4 className="font-bold text-sm truncate text-white group-hover:text-purple-400 transition">{actor.name}</h4>
                                    <p className="text-xs text-gray-500 truncate">{actor.character}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;