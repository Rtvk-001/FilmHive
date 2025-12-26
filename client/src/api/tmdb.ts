import axios from 'axios';

const BASE_URL = 'https://api.themoviedb.org/3';
const TOKEN = import.meta.env.VITE_TMDB_API_TOKEN as string;

const tmdb = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export const fetchTrending = async (): Promise<any[]> => {
  const res = await tmdb.get('/trending/movie/week');
  return res.data.results;
};

export const fetchTopRated = async (): Promise<any[]> => {
  const res = await tmdb.get('/movie/top_rated');
  return res.data.results;
};

// NEW: Fetch single movie details
export const fetchMovieDetails = async (id: string): Promise<any> => {
  const res = await tmdb.get(`/movie/${id}?append_to_response=credits,release_dates,watch/providers`);
  return res.data;
};

// Helper for image URLs
export const imgUrl = (path: string | null, size: string = 'original'): string => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const fetchPersonDetails = async (id: string): Promise<any> => {
  const res = await tmdb.get(`/person/${id}?append_to_response=movie_credits,images,external_ids`);
  return res.data;
};

export const fetchPersonCredits = async (id: string): Promise<any> => {
  const res = await tmdb.get(`/person/${id}/combined_credits`);
  return res.data;
};

// NEW: Fetch specific movie credits (for Co-Stars logic)
export const fetchMovieCredits = async (movieId: string): Promise<any> => {
    const res = await tmdb.get(`/movie/${movieId}/credits`);
    return res.data;
};

export const fetchTVDetails = async (id: string): Promise<any> => {
  const res = await tmdb.get(`/tv/${id}?append_to_response=credits,content_ratings,watch/providers,external_ids`);
  return res.data;
};

// NEW: Fetch Specific Season Details (for Episode list)
export const fetchSeasonDetails = async (tvId: string, seasonNumber: number): Promise<any> => {
    const res = await tmdb.get(`/tv/${tvId}/season/${seasonNumber}`);
    return res.data;
};