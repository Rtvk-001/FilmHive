import api from './api';
import type { Movie } from '../types';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w200';

export async function searchMovies(query: string): Promise<Movie[]> {
  const { data } = await api.get('/movies/search', { params: { query } });
  return data.map((m: any) => ({
    tmdbId: m.tmdbId,
    title: m.title,
    year: m.year,
    poster: m.poster ? m.poster : m.poster_path ? `${POSTER_BASE}${m.poster_path}` : ''
  }));
}

export async function getMovie(tmdbId: string): Promise<Movie> {
  const { data } = await api.get(`/movies/${tmdbId}`);
  return data;
}

export async function getPopularMovies(): Promise<Movie[]> {
  const { data } = await api.get('/movies/popular/top');
  return data;
}

export async function getTrendingMonth(): Promise<Movie[]> {
  const { data } = await api.get('/movies/trending/month');
  return data;
}

