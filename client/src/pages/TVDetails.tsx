import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchTVDetails, fetchSeasonDetails, imgUrl } from '../api/tmdb';
import { Plus, Clock, Calendar, Star, ChevronDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../state/AuthContext';
import axios from 'axios';
const TVDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, toggleWatchlist } = useAuth();
  
  const [show, setShow] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState<any>(null);
  const [seasonData, setSeasonData] = useState<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Main TV Show Data
  useEffect(() => {
    const loadShow = async () => {
      if (id) {
        try {
          const data = await fetchTVDetails(id);
          setShow(data);
          if (data.seasons && data.seasons.length > 0) {
             const firstSeason = data.seasons.find((s:any) => s.season_number === 1) || data.seasons[0];
             setSelectedSeason(firstSeason.season_number);
          }
        } catch (error) { console.error(error); }
      }
    };
    loadShow();
  }, [id]);

  // 2. Fetch Episode Data
  useEffect(() => {
    const loadEpisodes = async () => {
        if (id && selectedSeason !== null) {
            const data = await fetchSeasonDetails(id, selectedSeason);
            setSeasonData(data);
        }
    };
    loadEpisodes();
  }, [id, selectedSeason]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -500 : 500;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!show) return <div className="text-white text-center mt-20">Loading Series...</div>;

  const isInWatchlist = user?.watchlist?.some((m: any) => m.movieId === show.id.toString());
  const creator = show.created_by?.length > 0 ? show.created_by[0].name : 'Unknown';
  const rating = show.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US')?.rating || 'TV-14';
  const year = show.first_air_date?.split('-')[0] || 'N/A';
  
  const watchProviders = show['watch/providers']?.results?.US;
  const activeProviders = watchProviders?.flatrate || watchProviders?.rent || watchProviders?.buy || [];
  const markAsSeen = async () => {
    if (!user) return navigate('/login');
    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.post('http://localhost:5000/api/users/seen/tv', {
            tvId: show.id,
            name: show.name,
            posterPath: show.poster_path,
            totalEpisodes: show.number_of_episodes, // TMDB provides this
            totalSeasons: show.number_of_seasons
        }, config);
        alert(`Marked ${show.name} as complete!`);
    } catch (error: any) {
        alert(error.response?.data?.message || "Error marking as seen");
    }
};
  return (
    <div className="min-h-screen bg-[#0f1014] text-white font-sans pb-20 overflow-x-hidden">
      <Navbar />

      {/* BANNER */}
      <div className="relative w-full h-[400px] overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-top"
            style={{ backgroundImage: `url(${imgUrl(show.backdrop_path)})` }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f1014]/60 to-[#0f1014]"></div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12">
            
            {/* LEFT SIDEBAR */}
            <div className="space-y-6">
                <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                    <img src={imgUrl(show.poster_path)} alt={show.name} className="w-full" />
                </div>
                
                {/* WATCHLIST BUTTON */}
                <button 
                    onClick={() => toggleWatchlist(show)}
                    className={`w-full py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition 
                    ${isInWatchlist ? 'bg-red-500/10 text-red-500 border border-red-500/50' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                    {isInWatchlist ? <X size={18} /> : <Plus size={18} />} 
                    {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </button>

                {/* MARK AS SEEN BUTTON */}
                <button 
                    onClick={markAsSeen}
                    className="w-full bg-[#1a1b26] border border-gray-700 py-3 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-[#2e3048] transition text-gray-300 hover:text-white"
                >
                    <Check size={18} /> Mark as Seen
                </button>

                {/* STATS */}
                <div className="bg-[#1a1b26] p-5 rounded-xl space-y-4 text-sm text-gray-400">
                    <div>
                        <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Rating</span>
                        <div className="flex items-center gap-2 text-white font-bold text-lg">
                            <Star size={16} className="text-yellow-500" fill="currentColor"/> {show.vote_average.toFixed(1)}
                        </div>
                    </div>
                    <div>
                        <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Age Rating</span>
                        <span className="text-white border border-gray-600 px-2 py-0.5 rounded text-xs">{rating}</span>
                    </div>
                    <div>
                        <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Creator</span>
                        <span className="text-white">{creator}</span>
                    </div>
                    <div>
                        <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Seasons</span>
                        <span className="text-white">{show.number_of_seasons} Seasons</span>
                    </div>
                    <div>
                        <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Status</span>
                        <span className="text-white">{show.status}</span>
                    </div>
                </div>
            </div>

            {/* RIGHT MAIN CONTENT - Added min-w-0 to prevent grid blowout */}
            <div className="pt-8 min-w-0">
                <h1 className="text-5xl font-bold mb-4">{show.name}</h1>
                
                <div className="flex flex-wrap items-center gap-4 mb-8 text-sm">
                    <div className="flex gap-2">
                        {show.genres.map((g: any) => (
                            <span key={g.id} className="border border-gray-600 px-3 py-1 rounded-full text-xs hover:bg-white/10 cursor-default">
                                {g.name}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 text-gray-400"><Calendar size={14}/> {year}</div>
                    <div className="flex items-center gap-1 text-gray-400"><Clock size={14}/> {show.episode_run_time?.[0] || 45}m</div>
                </div>

                {/* Where to Watch */}
                <div className="bg-white text-black rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2 uppercase tracking-wide">Stream On</h3>
                        {activeProviders.length > 0 ? (
                            <div className="flex flex-wrap gap-4">
                                {activeProviders.map((p: any) => (
                                    <div key={p.provider_id} className="flex items-center gap-2 bg-gray-100 pr-3 rounded-full overflow-hidden border border-gray-200">
                                        <img src={imgUrl(p.logo_path, 'w92')} alt={p.provider_name} className="w-8 h-8 object-cover"/>
                                        <span className="text-sm font-semibold text-gray-800">{p.provider_name}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (<span className="text-sm text-gray-500">Not available to stream in US</span>)}
                    </div>
                </div>

                <div className="mb-10">
                    <h3 className="text-xl font-bold mb-4 uppercase text-gray-300">Synopsis</h3>
                    <p className="text-gray-300 leading-relaxed text-lg">{show.overview}</p>
                </div>

                {/* --- EPISODE DETAILS SECTION --- */}
                <div className="mb-12 relative group/slider">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold uppercase text-gray-300">Episodes</h3>
                        
                        {/* Season Dropdown */}
                        <div className="relative group z-40">
                            <button className="flex items-center gap-2 bg-[#1a1b26] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#2e3048]">
                                {seasonData ? seasonData.name : 'Select Season'} <ChevronDown size={14}/>
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-[#1a1b26] border border-gray-700 rounded-xl shadow-xl overflow-hidden hidden group-hover:block">
                                {show.seasons.map((s: any) => (
                                    <div 
                                        key={s.id} 
                                        onClick={() => setSelectedSeason(s.season_number)}
                                        className={`px-4 py-3 text-sm cursor-pointer hover:bg-white/10 ${selectedSeason === s.season_number ? 'text-purple-400 font-bold' : 'text-gray-300'}`}
                                    >
                                        {s.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SCROLL BUTTONS */}
                    <button 
                        onClick={() => scroll('left')}
                        className="absolute -left-4 top-1/2 translate-y-4 z-10 bg-[#1a1b26] border border-gray-700 p-2 rounded-full hover:bg-purple-600 transition shadow-lg hidden md:flex opacity-0 group-hover/slider:opacity-100"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={() => scroll('right')}
                        className="absolute -right-4 top-1/2 translate-y-4 z-10 bg-[#1a1b26] border border-gray-700 p-2 rounded-full hover:bg-purple-600 transition shadow-lg hidden md:flex opacity-0 group-hover/slider:opacity-100"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* HORIZONTAL SCROLL CONTAINER */}
                    {seasonData ? (
                         <div 
                            ref={scrollRef}
                            className="flex overflow-x-auto gap-4 pb-6 scroll-smooth scrollbar-hide snap-x"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} 
                         >
                            {seasonData.episodes.map((ep: any) => (
                                <div key={ep.id} className="min-w-[280px] w-[280px] flex-shrink-0 snap-start group cursor-default">
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-[#1a1b26] shadow-lg border border-gray-800">
                                        <img 
                                            src={imgUrl(ep.still_path, 'w500')} 
                                            className="w-full h-full object-cover transition duration-500" 
                                            alt={ep.name} 
                                        />
                                        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-xs font-bold backdrop-blur-sm">
                                            {ep.runtime || '?'}m
                                        </div>
                                    </div>
                                    {/* Info */}
                                    <h4 className="font-bold text-gray-200 truncate">
                                        {ep.episode_number}. {ep.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed h-8">
                                        {ep.overview || "No description available."}
                                    </p>
                                </div>
                            ))}
                         </div>
                    ) : (
                        <div className="text-gray-500 italic">Loading episodes...</div>
                    )}
                </div>

                {/* Cast */}
                <div>
                    <h3 className="text-xl font-bold mb-6 uppercase text-gray-300">Series Cast</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {show.credits?.cast?.slice(0, 8).map((actor: any) => (
                            <div key={actor.id} onClick={() => navigate(`/person/${actor.id}`)} className="bg-[#1a1b26] p-3 rounded-xl flex items-center gap-3 hover:bg-[#2e3048] transition cursor-pointer">
                                <img src={actor.profile_path ? imgUrl(actor.profile_path, 'w200') : 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-full object-cover" alt={actor.name}/>
                                <div className="overflow-hidden">
                                    <h4 className="font-bold text-sm truncate text-white">{actor.name}</h4>
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

export default TVDetails;