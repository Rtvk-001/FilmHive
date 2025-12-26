import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { imgUrl } from '../api/tmdb';

const Connections = () => {
  const { id } = useParams(); // User ID
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type'); // 'followers' or 'following'
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${id}`);
        const user = res.data;
        if (type === 'followers') {
            setData(user.followers || []);
        } else {
            setData(user.following || []);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, [id, type]);

  return (
    <div className="min-h-screen bg-[#0f1014] text-white font-sans">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 mt-8">
        <h1 className="text-3xl font-bold mb-8 capitalize">{type}</h1>

        {loading ? <div>Loading...</div> : (
            <div className="space-y-4">
                {data.length === 0 ? (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-gray-500">Oh...such empty!</h2>
                    </div>
                ) : (
                    data.map((item: any) => (
                        <div 
                            key={item.id || item.userId} // Handle schema difference (following has .id, followers has .userId)
                            onClick={() => {
                                // Smart Redirect
                                if (item.userId) navigate(`/profile/${item.userId}`); // It's a User follower
                                else if (item.type === 'person') navigate(`/person/${item.id}`); // It's an Actor
                                else navigate(`/profile/${item.id}`); // It's a User following
                            }}
                            className="bg-[#1a1b26] p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-[#2e3048] transition"
                        >
                            <img 
                                src={
                                    item.profilePicture || 
                                    (item.image ? imgUrl(item.image, 'w200') : "https://via.placeholder.com/50")
                                } 
                                className="w-12 h-12 rounded-full object-cover" 
                                alt={item.name || item.username} 
                            />
                            <div>
                                <h4 className="font-bold">{item.name || item.username}</h4>
                                <span className="text-xs text-gray-500 capitalize">
                                    {item.type === 'person' ? 'Artist' : 'User'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default Connections;