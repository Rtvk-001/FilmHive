import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../state/AuthContext';
import { imgUrl } from '../api/tmdb';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Settings, MessageSquare, UserMinus, UserPlus, LogOut, MoreHorizontal, Plus } from 'lucide-react';

const Profile = () => {
  const { user: authUser, logout } = useAuth();
  const { id } = useParams(); // ID from URL
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // 1. Determine if we are viewing our own profile
  const isOwnProfile = !id || (authUser && id === authUser._id);
  const profileId = isOwnProfile ? authUser?._id : id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) return;
      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:5000/api/users/${profileId}`);
        setProfile(data);

        // Check if I am following this user
        if (authUser && !isOwnProfile) {
            const amIFollowing = authUser.following?.some((f: any) => f.id === data._id);
            setIsFollowing(amIFollowing);
        }

      } catch (error) {
        console.error("Error fetching profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [profileId, authUser, isOwnProfile]);

  // Handle Follow/Unfollow
  const handleFollowToggle = async () => {
    if (!authUser) return navigate('/login');
    
    try {
        const config = { headers: { Authorization: `Bearer ${authUser.token}` } };
        
        if (isFollowing) {
            await axios.post('http://localhost:5000/api/users/unfollow', { targetId: profile._id, type: 'user' }, config);
            setIsFollowing(false);
            // Optimistic Update: Decrement follower count locally
            setProfile((prev: any) => ({ ...prev, followers: prev.followers.slice(0, -1) }));
        } else {
            await axios.post('http://localhost:5000/api/users/follow', { 
                targetId: profile._id, 
                name: profile.username, 
                image: profile.profilePicture, 
                type: 'user' 
            }, config);
            setIsFollowing(true);
            // Optimistic Update: Increment follower count locally
            setProfile((prev: any) => ({ 
                ...prev, 
                followers: [...(prev.followers || []), { userId: authUser._id }] 
            }));
        }
    } catch (error) {
        console.error("Follow error", error);
    }
  };

  if (loading) return <div className="text-white text-center mt-20">Loading Profile...</div>;
  if (!profile) return <div className="text-white text-center mt-20">User not found</div>;

  const days = Math.floor(profile.totalRuntime / 1440);
  const hours = Math.floor((profile.totalRuntime % 1440) / 60);
  
  const recentActivity = [...(profile.activityLog || [])].reverse();
  const recentWatchlist = [...(profile.watchlist || [])].reverse().slice(0, 5);
  
  // "Interested In" = People/Actors the user follows
  const interestedIn = [...(profile.following || [])]
    .filter((f: any) => f.type === 'person') // Only Actors
    .reverse()
    .slice(0, 5);

  const followersCount = profile.followers?.length || 0;
  const followingCount = profile.following?.length || 0;

  return (
    <div className="min-h-screen bg-[#0f1014] text-white font-sans pb-20">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-6 mt-8">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
            <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-[#1a1b26] shadow-2xl shrink-0">
                <img 
                    src={profile.profilePicture || "https://via.placeholder.com/200?text=User"} 
                    alt={profile.username} 
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="flex-1 w-full">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold mb-1">{profile.username}</h1>
                        <div className="text-gray-400 text-sm flex gap-4 mb-4">
                             <span>@{profile.username.toLowerCase().replace(" ", "_")}</span>
                             <span className="flex items-center gap-1">Watch time: <span className="text-white font-bold">{days} days {hours} hours</span></span>
                        </div>
                    </div>
                    
                    {/* BUTTONS: Hide if Own Profile, Show if Other */}
                    <div className="flex gap-2">
                        {!isOwnProfile ? (
                            <>
                                <button className="bg-purple-600 px-4 py-2 rounded-full text-xs font-bold hover:bg-purple-700 flex items-center gap-2">
                                    <MessageSquare size={14}/> MESSAGE
                                </button>
                                <button 
                                    onClick={handleFollowToggle}
                                    className={`px-4 py-2 rounded-full text-xs font-bold flex gap-1 items-center transition
                                    ${isFollowing ? 'border border-gray-600 hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200'}`}
                                >
                                    {isFollowing ? (
                                        <>UNFOLLOW <UserMinus size={12}/></>
                                    ) : (
                                        <>FOLLOW <UserPlus size={12}/></>
                                    )}
                                </button>
                            </>
                        ) : (
                            <button className="border border-gray-600 p-2 rounded-full hover:bg-gray-800"><Settings size={14}/></button>
                        )}
                    </div>
                </div>

                {/* Stats Bar - CLICKABLE */}
                <div className="bg-[#1a1b26] rounded-xl p-6 flex justify-between text-center md:text-left mt-2 shadow-lg border border-gray-800">
                    <div 
                        className="cursor-pointer hover:opacity-80 transition"
                        onClick={() => navigate(`/profile/${profile._id}/connections?type=followers`)}
                    >
                        <span className="block text-2xl font-bold">{followersCount}</span>
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Followers</span>
                    </div>
                    <div 
                        className="cursor-pointer hover:opacity-80 transition"
                        onClick={() => navigate(`/profile/${profile._id}/connections?type=following`)}
                    >
                        <span className="block text-2xl font-bold">{followingCount}</span>
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Following</span>
                    </div>
                    <div><span className="block text-2xl font-bold">{profile.moviesWatched}</span><span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Movies Seen</span></div>
                    <div><span className="block text-2xl font-bold">0</span><span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Episodes</span></div>
                    <div><span className="block text-2xl font-bold">0</span><span className="text-xs text-gray-500 uppercase font-bold tracking-wider">TV Shows</span></div>
                </div>
            </div>
        </div>

        {/* --- GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-8">
            
            {/* LEFT: INTERESTED IN */}
            <div className="flex flex-col h-full gap-8">
                <div className="bg-[#1a1b26] rounded-3xl p-6 border border-gray-800 min-h-[400px]">
                    <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-6">
                        {profile.username} IS INTERESTED
                    </h3>
                    
                    <div className="space-y-5">
                        {interestedIn.length > 0 ? interestedIn.map((person: any, idx: number) => (
                            <div 
                                key={idx} 
                                onClick={() => navigate(`/person/${person.id}`)}
                                className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                            >
                                <img src={person.image ? imgUrl(person.image, 'w200') : "https://via.placeholder.com/40"} className="w-10 h-10 rounded-full object-cover" alt={person.name} />
                                <span className="text-sm font-bold text-gray-300 truncate">{person.name}</span>
                            </div>
                        )) : (
                            <div className="text-gray-500 text-sm italic">Not following any artists yet.</div>
                        )}
                    </div>
                    
                    {interestedIn.length > 0 && (
                        <button 
                            onClick={() => navigate(`/profile/${profile._id}/connections?type=following`)}
                            className="mt-6 text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1"
                        >
                            SEE ALL <span className="text-lg">↗</span>
                        </button>
                    )}
                </div>
                
                {/* LOGOUT BUTTON (Only on Own Profile) */}
                {isOwnProfile && (
                    <button 
                        onClick={logout}
                        className="w-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-3xl p-4 flex items-center justify-center gap-2 font-bold text-sm transition mt-auto"
                    >
                        <LogOut size={16} /> Log Out
                    </button>
                )}
            </div>

            {/* CENTER: ACTIVITY */}
            <div>
                <div className="flex gap-6 mb-6 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800 pb-4">
                    <span className="text-white cursor-pointer bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full">Latest Activities</span>
                </div>

                <div className="space-y-4">
                    {recentActivity.length > 0 ? recentActivity.map((act: any, idx: number) => (
                        <div key={idx} className="bg-white text-black rounded-3xl p-5 relative">
                            <div className="flex items-center gap-3 mb-3">
                                <img src={profile.profilePicture || "https://via.placeholder.com/40"} className="w-8 h-8 rounded-full" alt="User" />
                                <div className="text-sm">
                                    <span className="font-bold">{profile.username}</span> <span className="text-gray-600">{act.content}</span>
                                </div>
                                <span className="ml-auto text-xs text-gray-400">Recent</span>
                            </div>
                            {act.image && (
                                <div 
                                    className="flex gap-4 bg-gray-100 rounded-2xl p-3 cursor-pointer hover:bg-gray-200 transition"
                                    onClick={() => {
                                        if (act.type === 'follow') return; // Don't click if it's a follow event
                                        navigate(`/movie/${act.targetId}`);
                                    }}
                                >
                                    <img src={imgUrl(act.image, 'w92')} className="w-16 h-24 object-cover rounded-lg shadow-sm" alt="" />
                                    <div className="flex flex-col justify-center">
                                        <h4 className="font-bold text-lg mb-1">{act.type === 'follow' ? 'Artist' : 'Movie'}</h4>
                                        <div className="flex items-center gap-1 text-xs font-bold bg-black text-white px-2 py-1 rounded w-fit">
                                            {act.type === 'follow' ? 'PERSON' : 'MOVIE'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="bg-[#1a1b26] rounded-3xl p-10 text-center border border-gray-800">
                            <h3 className="text-xl font-bold mb-2">Hmm... No activity</h3>
                            <p className="text-gray-400 text-sm mb-6">This user is sleeping.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: WATCHLIST */}
            <div className="space-y-8">
                <div className="bg-[#1a1b26] rounded-3xl p-6 border border-gray-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">
                            {profile.username.toUpperCase()}'S COLLECTIONS
                        </h3>
                    </div>

                    <div className="space-y-3">
                        {recentWatchlist.length > 0 ? recentWatchlist.map((movie: any) => (
                            <div key={movie.movieId} className="group relative h-16 rounded-xl overflow-hidden cursor-pointer" onClick={() => navigate(`/movie/${movie.movieId}`)}>
                                <img src={imgUrl(movie.posterPath, 'w300')} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition" alt={movie.title} />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent p-3 flex items-center justify-between">
                                    <span className="font-bold text-sm truncate pr-4">{movie.title}</span>
                                    <div className="w-6 h-6 rounded-full border border-gray-500 flex items-center justify-center group-hover:bg-white group-hover:text-black transition">
                                        <span className="text-xs">↗</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                             <div className="text-gray-500 text-sm italic text-center py-8 border border-dashed border-gray-700 rounded-xl">
                                Watchlist is empty.
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

export default Profile;