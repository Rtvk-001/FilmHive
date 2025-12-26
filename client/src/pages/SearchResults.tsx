import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { imgUrl } from '../api/tmdb';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const navigate = useNavigate();
  
  const [results, setResults] = useState<any>({ users: [], tmdb: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearch = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:5000/api/search?q=${query}`);
        setResults(data);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSearch();
  }, [query]);

  // Filter TMDB results by type
  const movies = results.tmdb.filter((i: any) => i.media_type === 'movie' || i.media_type === 'tv');
  const people = results.tmdb.filter((i: any) => i.media_type === 'person');

  return (
    <div className="min-h-screen bg-[#0f1014] text-white font-sans pb-20">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-6 mt-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-200">
            Results for: <span className="text-white">"{query}"</span>
        </h1>

        {loading ? (
            <div className="text-center mt-20">Searching Hive...</div>
        ) : (
            <div className="space-y-12">
                
                {/* 1. USERS SECTION */}
                {results.users.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2">Users</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {results.users.map((user: any) => (
                                <div 
                                    key={user._id} 
                                    // Navigate to Profile (Note: We'll need to update Profile to handle IDs later)
                                    onClick={() => navigate(`/profile/${user._id}`)}
                                    className="bg-[#1a1b26] p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-[#2e3048] transition"
                                >
                                    <img 
                                        src={user.profilePicture || "https://via.placeholder.com/50"} 
                                        className="w-12 h-12 rounded-full object-cover" 
                                        alt={user.username} 
                                    />
                                    <div>
                                        <h4 className="font-bold">{user.username}</h4>
                                        <span className="text-xs text-gray-500">FilmHive Member</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 2. MOVIES & TV */}
                {movies.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2">Movies & TV</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {movies.map((item: any) => (
                                <MovieCard key={item.id} movie={item} />
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. ARTISTS / PEOPLE */}
                {people.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2">Artists & People</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                            {people.map((person: any) => (
                                <div 
                                    key={person.id}
                                    onClick={() => navigate(`/person/${person.id}`)}
                                    className="bg-[#1a1b26] rounded-xl overflow-hidden cursor-pointer hover:ring-2 ring-purple-500 transition group"
                                >
                                    <div className="aspect-[2/3] overflow-hidden">
                                        <img 
                                            src={imgUrl(person.profile_path, 'w500')} 
                                            alt={person.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        />
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-bold text-sm truncate">{person.name}</h4>
                                        <p className="text-xs text-gray-500">Artist</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* NO RESULTS */}
                {results.users.length === 0 && movies.length === 0 && people.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        No results found. Try searching for "John Wick" or a generic username.
                    </div>
                )}

            </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;