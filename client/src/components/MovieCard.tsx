import React from 'react';
import { imgUrl } from '../api/tmdb';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

const MovieCard = ({ movie }: { movie: any }) => {
  const navigate = useNavigate();

  // Determine if it's a TV show or Movie based on API data
  // If 'name' exists, it's usually TV. If 'title' exists, it's Movie.
  // Or use 'media_type' if available.
  const isTV = movie.media_type === 'tv' || !!movie.name;
  const link = isTV ? `/tv/${movie.id}` : `/movie/${movie.id}`;
  const title = movie.title || movie.name;

  return (
    <div 
      onClick={() => navigate(link)}
      className="cursor-pointer group relative flex flex-col gap-2 w-full"
    >
      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg bg-[#1a1b26] transition-transform duration-300 group-hover:scale-105 group-hover:ring-2 ring-purple-500">
        <img 
          src={imgUrl(movie.poster_path, 'w500')} 
          alt={title}
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                <Star className="text-white fill-white" size={24} />
            </div>
        </div>

        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1">
            <span className="text-xs font-bold text-yellow-400">{movie.vote_average?.toFixed(1)}</span>
        </div>
      </div>

      <h3 className="text-sm font-medium text-gray-300 group-hover:text-white truncate">
        {title}
      </h3>
    </div>
  );
};

export default MovieCard;