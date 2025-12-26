import User from '../models/User.js';

// @desc    Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add to Watchlist (Debug Version)
export const addToWatchlist = async (req, res) => {
  try {
    // 1. Log the incoming request
    console.log("AddToWatchlist called by user:", req.user._id);
    console.log("Movie Data:", req.body);

    const { movieId, title, posterPath } = req.body;
    const userId = req.user._id; // Use _id for safety

    // 2. Fetch User fresh from DB
    const user = await User.findById(userId);
    if (!user) {
        console.log("User not found in Controller");
        return res.status(404).json({ message: 'User not found' });
    }

    // 3. FORCE ARRAYS TO EXIST (The "Crash Proof" Fix)
    if (!Array.isArray(user.watchlist)) {
        console.log("Watchlist was missing, creating it...");
        user.watchlist = [];
    }
    if (!Array.isArray(user.activityLog)) {
        console.log("ActivityLog was missing, creating it...");
        user.activityLog = [];
    }

    // 4. Check for duplicates
    const exists = user.watchlist.find(m => m.movieId === movieId.toString());
    if (exists) {
        return res.status(400).json({ message: 'Already in watchlist' });
    }

    // 5. Add Data
    user.watchlist.push({ movieId, title, posterPath });
    user.activityLog.push({
        type: 'watchlist',
        content: `added ${title} to their watchlist`,
        targetId: movieId,
        image: posterPath
    });

    await user.save();
    console.log("Success! Watchlist updated.");
    res.status(200).json(user.watchlist);

  } catch (error) {
    console.error("CRITICAL CONTROLLER ERROR:", error); // This will show in your terminal
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove from Watchlist
export const removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { movieId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (Array.isArray(user.watchlist)) {
        user.watchlist = user.watchlist.filter(m => m.movieId !== movieId.toString());
        await user.save();
    }
    
    res.status(200).json(user.watchlist || []);
  } catch (error) {
    console.error("Remove Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const followTarget = async (req, res) => {
  const { targetId, name, image, type } = req.body; // type = 'user' or 'person'
  const currentUserId = req.user._id;

  try {
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    // 1. Add to Current User's "Following" list
    const isFollowing = currentUser.following.some(f => f.id === targetId);
    if (isFollowing) return res.status(400).json({ message: "Already following" });

    currentUser.following.push({ id: targetId, name, image, type });
    
    // Add Activity Log
    currentUser.activityLog.push({
        type: 'follow',
        content: `started following ${name}`,
        targetId,
        image
    });

    await currentUser.save();

    // 2. If target is a USER, update their "Followers" list
    if (type === 'user') {
        const targetUser = await User.findById(targetId);
        if (targetUser) {
            targetUser.followers.push({
                userId: currentUser._id,
                username: currentUser.username,
                profilePicture: currentUser.profilePicture
            });
            await targetUser.save();
        }
    }

    res.status(200).json(currentUser.following);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unfollow a User or Artist
// @route   POST /api/users/unfollow
export const unfollowTarget = async (req, res) => {
  const { targetId, type } = req.body;
  const currentUserId = req.user._id;

  try {
    const currentUser = await User.findById(currentUserId);

    // 1. Remove from Current User's "Following"
    currentUser.following = currentUser.following.filter(f => f.id !== targetId);
    await currentUser.save();

    // 2. If target is a USER, remove from their "Followers"
    if (type === 'user') {
        const targetUser = await User.findById(targetId);
        if (targetUser) {
            targetUser.followers = targetUser.followers.filter(f => f.userId.toString() !== currentUserId.toString());
            await targetUser.save();
        }
    }

    res.status(200).json(currentUser.following);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markMovieSeen = async (req, res) => {
  const { movieId, title, posterPath, runtime } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1. Check if already seen (Prevent duplicate stats)
    if (!Array.isArray(user.watchedMovies)) user.watchedMovies = [];
    const alreadySeen = user.watchedMovies.find(m => m.movieId === movieId.toString());
    
    if (alreadySeen) return res.status(400).json({ message: 'Already marked as seen' });

    // 2. Add to Watched List
    user.watchedMovies.push({ movieId, title, posterPath });
    user.moviesWatched = (user.moviesWatched || 0) + 1;
    if (runtime) user.totalRuntime = (user.totalRuntime || 0) + runtime;

    // 3. Remove from Watchlist if exists
    if (user.watchlist) {
        user.watchlist = user.watchlist.filter(m => m.movieId !== movieId.toString());
    }

    // 4. Add Activity
    if (!Array.isArray(user.activityLog)) user.activityLog = [];
    user.activityLog.push({
        type: 'seen',
        content: `watched ${title}`,
        targetId: movieId,
        image: posterPath
    });

    await user.save();
    res.status(200).json({ 
        watchedMovies: user.watchedMovies, 
        watchlist: user.watchlist,
        moviesWatched: user.moviesWatched 
    });

  } catch (error) {
    console.error("Mark Seen Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark TV Show as Seen
// @route   POST /api/users/seen/tv
export const markTVSeen = async (req, res) => {
  const { tvId, name, posterPath, totalEpisodes, totalSeasons } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1. Check if already seen
    if (!Array.isArray(user.watchedTV)) user.watchedTV = [];
    const alreadySeen = user.watchedTV.find(s => s.tvId === tvId.toString());
    if (alreadySeen) return res.status(400).json({ message: 'Already marked as seen' });

    // 2. Add to Watched TV List
    user.watchedTV.push({ tvId, name, posterPath });

    // 3. Update Stats
    user.tvShowsWatched = (user.tvShowsWatched || 0) + 1;
    
    // Add all episodes to count (assuming totalEpisodes is passed from TMDB)
    const episodesToAdd = parseInt(totalEpisodes) || 0;
    user.episodesWatched = (user.episodesWatched || 0) + episodesToAdd;

    // 4. Remove from Watchlist if exists
    if (user.watchlist) {
        user.watchlist = user.watchlist.filter(m => m.movieId !== tvId.toString());
    }

    // 5. Add Activity
    if (!Array.isArray(user.activityLog)) user.activityLog = [];
    user.activityLog.push({
        type: 'seen',
        content: `watched ${name} (${totalSeasons} Seasons)`,
        targetId: tvId,
        image: posterPath
    });

    await user.save();
    res.status(200).json({
        watchedTV: user.watchedTV,
        watchlist: user.watchlist,
        tvShowsWatched: user.tvShowsWatched,
        episodesWatched: user.episodesWatched
    });

  } catch (error) {
    console.error("Mark TV Seen Error:", error);
    res.status(500).json({ message: error.message });
  }
};