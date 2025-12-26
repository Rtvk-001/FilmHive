import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { imgUrl } from '../api/tmdb';
import { ChevronLeft } from 'lucide-react';

const History = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type'); // 'movies' or 'tv'
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${id}`);
        const user = res.data;
        if (type === 'movies') {
            setData(user.watchedMovies || []);
        } else {
            setData(user.watchedTV || []);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, [id, type]);

  return (
    <div className="min-h-screen bg-[#0f1014] text-white font-sans">
      <Navbar />
      <div className="max-w-[1600px] mx-auto px-6 mt-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
            <ChevronLeft size={20} /> Back to Profile
        </button>
        
        <h1 className="text-3xl font-bold mb-8 capitalize">{type === 'tv' ? 'TV Shows Seen' : 'Movies Seen'}</h1>

        {loading ? <div>Loading...</div> : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {data.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-500">
                        Nothing here yet.
                    </div>
                ) : (
                    data.reverse().map((item: any, idx: number) => (
                        <div 
                            key={idx} 
                            onClick={() => navigate(type === 'tv' ? `/tv/${item.tvId}` : `/movie/${item.movieId}`)}
                            className="cursor-pointer group"
                        >
                            <div className="rounded-xl overflow-hidden aspect-[2/3] bg-[#1a1b26] mb-2">
                                <img 
                                    src={imgUrl(item.posterPath, 'w300')} 
                                    alt={item.title || item.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                />
                            </div>
                            <h4 className="text-sm font-bold truncate text-gray-300 group-hover:text-white">{item.title || item.name}</h4>
                        </div>
                    ))
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default History;