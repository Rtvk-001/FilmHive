import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchPersonDetails, fetchPersonCredits, imgUrl } from '../api/tmdb';
import { Facebook, Twitter, Instagram, Link as LinkIcon, ChevronDown, UserPlus, UserMinus, Star } from 'lucide-react';
import { useAuth } from '../state/AuthContext';
import axios from 'axios';

const ActorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [person, setPerson] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [showFullBio, setShowFullBio] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // 1. Load Data & Check Follow Status
  useEffect(() => {
    const loadData = async () => {
      if (id) {
        try {
          const personData = await fetchPersonDetails(id);
          const creditsData = await fetchPersonCredits(id);
          setPerson(personData);
          setCredits(creditsData);
          
          // Check if already following (Convert both IDs to Strings for safety)
          if (user && user.following) {
             const alreadyFollowing = user.following.some(
                 (f: any) => f.id.toString() === personData.id.toString()
             );
             setIsFollowing(alreadyFollowing);
          }
        } catch (error) {
          console.error("Error loading actor details", error);
        }
      }
    };
    loadData();
  }, [id, user]);

  // 2. Toggle Follow Function
  const toggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();    // Prevent navigation issues
    e.stopPropagation();   // Stop bubbling
    
    if (!user) {
        alert("Please login to follow artists.");
        navigate('/login');
        return;
    }

    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const targetIdString = person.id.toString(); 
        
        if (isFollowing) {
            // UNFOLLOW
            await axios.post('http://localhost:5000/api/users/unfollow', { 
                targetId: targetIdString, 
                type: 'person' 
            }, config);
            setIsFollowing(false);
        } else {
            // FOLLOW
            await axios.post('http://localhost:5000/api/users/follow', { 
                targetId: targetIdString, 
                name: person.name, 
                image: person.profile_path, 
                type: 'person' 
            }, config);
            setIsFollowing(true);
        }
    } catch (error: any) {
        console.error("Follow Error:", error);
        alert(`Error: ${error.response?.data?.message || "Something went wrong"}`);
    }
  };

  if (!person) return <div className="text-white text-center mt-20">Loading...</div>;

  const knownFor = credits?.cast
    ?.sort((a: any, b: any) => b.popularity - a.popularity)
    ?.slice(0, 8) || [];
  
  const filmography = credits?.cast
    ?.filter((c: any) => c.release_date)
    ?.sort((a: any, b: any) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()) || [];

  return (
    <div className="min-h-screen bg-[#0f1014] text-white font-sans pb-20">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12">
            
            {/* LEFT SIDEBAR */}
            <div className="space-y-6">
                <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-[#1a1b26] aspect-[2/3]">
                    <img 
                        src={imgUrl(person.profile_path, 'w500')} 
                        alt={person.name} 
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* SOCIAL LINKS */}
                <div className="flex justify-center gap-4 text-gray-400">
                    {person.external_ids?.twitter_id && <Twitter className="hover:text-[#1DA1F2] cursor-pointer transition" />}
                    {person.external_ids?.instagram_id && <Instagram className="hover:text-[#E1306C] cursor-pointer transition" />}
                    {person.external_ids?.facebook_id && <Facebook className="hover:text-[#1877F2] cursor-pointer transition" />}
                    {person.homepage && <LinkIcon className="hover:text-white cursor-pointer transition" />}
                </div>

                {/* FOLLOW BUTTON - Added z-50 and relative to fix click issues */}
                <button 
                    onClick={toggleFollow}
                    className={`relative z-50 w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition border 
                    ${isFollowing 
                        ? 'bg-black border-gray-600 text-white hover:bg-gray-900' 
                        : 'bg-purple-600 border-purple-600 text-white hover:bg-purple-700'}`}
                >
                    {isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />} 
                    {isFollowing ? 'Unfollow' : 'Follow'}
                </button>

                {/* PERSONAL INFO */}
                <div className="space-y-4 pt-4">
                    <h3 className="text-xl font-bold text-white mb-4">Personal Info</h3>
                    
                    <div>
                        <span className="block text-sm font-bold text-gray-400">Known For</span>
                        <span className="block text-sm text-gray-200">{person.known_for_department}</span>
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-gray-400">Gender</span>
                        <span className="block text-sm text-gray-200">{person.gender === 1 ? 'Female' : 'Male'}</span>
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-gray-400">Birthday</span>
                        <span className="block text-sm text-gray-200">{person.birthday}</span>
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-gray-400">Place of Birth</span>
                        <span className="block text-sm text-gray-200">{person.place_of_birth}</span>
                    </div>
                </div>
            </div>

            {/* RIGHT MAIN CONTENT */}
            <div>
                <h1 className="text-5xl font-bold mb-8">{person.name}</h1>

                {/* BIOGRAPHY */}
                <div className="mb-12">
                    <h3 className="text-xl font-bold mb-4 border-l-4 border-purple-500 pl-3">Biography</h3>
                    <div className="relative">
                        <p className={`text-gray-300 leading-relaxed text-lg ${!showFullBio && 'line-clamp-6'}`}>
                            {person.biography || "No biography available."}
                        </p>
                        {person.biography && person.biography.length > 500 && (
                            <button 
                                onClick={() => setShowFullBio(!showFullBio)}
                                className="flex items-center gap-1 text-purple-400 font-bold mt-2 text-sm hover:text-purple-300 transition"
                            >
                                Read {showFullBio ? 'Less' : 'More'} <ChevronDown size={14} className={`transition-transform ${showFullBio ? 'rotate-180' : ''}`} />
                            </button>
                        )}
                    </div>
                </div>

                {/* KNOWN FOR */}
                <div className="mb-12">
                    <h3 className="text-xl font-bold mb-6 border-l-4 border-purple-500 pl-3">Known For</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {knownFor.map((movie: any) => (
                            <div 
                                key={movie.id} 
                                onClick={() => navigate(`/movie/${movie.id}`)}
                                className="cursor-pointer group"
                            >
                                <div className="rounded-xl overflow-hidden mb-2 aspect-[2/3] bg-[#1a1b26]">
                                    <img 
                                        src={imgUrl(movie.poster_path, 'w300')} 
                                        alt={movie.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    />
                                </div>
                                <h4 className="text-sm font-bold text-center group-hover:text-purple-400 transition truncate">{movie.title}</h4>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FILMOGRAPHY */}
                <div>
                    <h3 className="text-xl font-bold mb-6 border-l-4 border-purple-500 pl-3">Filmography</h3>
                    <div className="bg-[#1a1b26] rounded-2xl p-6 border border-gray-800 shadow-xl">
                        <div className="space-y-4">
                            {filmography.slice(0, 20).map((movie: any, idx: number) => (
                                <div key={idx} className="flex gap-4 border-b border-gray-800 pb-4 last:border-0 last:pb-0 group">
                                    <div className="min-w-[50px] font-bold text-gray-500 pt-1">
                                        {movie.release_date?.split('-')[0] || '-'}
                                    </div>
                                    <div className="flex-1">
                                        <h4 
                                            onClick={() => navigate(`/movie/${movie.id}`)}
                                            className="font-bold text-lg cursor-pointer hover:text-purple-400 transition inline-flex items-center gap-2"
                                        >
                                            {movie.title}
                                            {movie.vote_average > 7.5 && <Star size={12} className="text-yellow-500 fill-yellow-500" />}
                                        </h4>
                                        <p className="text-sm text-gray-400">
                                            as <span className="text-gray-300">{movie.character || 'Unknown Role'}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filmography.length > 20 && (
                            <div className="text-center mt-6 pt-4 border-t border-gray-800">
                                <button className="text-sm font-bold text-gray-400 hover:text-white transition">View All Credits</button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default ActorDetails;