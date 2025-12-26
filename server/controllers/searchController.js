import axios from 'axios';
import User from '../models/User.js';

// @desc    Search for Users, Movies, TV, and People
// @route   GET /api/search?q=query
export const searchAll = async (req, res) => {
  const query = req.query.q;

  if (!query) return res.status(400).json({ message: 'Query required' });

  try {
    // 1. Search Local Users (MongoDB)
    // Using Regex for case-insensitive partial matching
    const userResults = await User.find({ 
      username: { $regex: query, $options: 'i' } 
    }).select('_id username profilePicture followers').limit(5);

    // 2. Search TMDB (Movies, TV, People)
    const tmdbUrl = `https://api.themoviedb.org/3/search/multi?api_key=${process.env.TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`;
    
    // Note: You need your TMDB key in .env as TMDB_API_KEY for this to work on backend
    // Or you can pass the client token if you prefer, but backend env is safer.
    // For now, let's assume you add TMDB_API_KEY to your server .env file.
    const { data } = await axios.get(tmdbUrl);

    res.json({
      users: userResults,
      tmdb: data.results // This contains movies, tv, and person mixed
    });

  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: 'Search failed' });
  }
};