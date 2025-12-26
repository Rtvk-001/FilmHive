import express from 'express';
import { 
    getUserProfile, addToWatchlist, removeFromWatchlist, 
    followTarget, unfollowTarget, 
    markMovieSeen, markTVSeen // <--- Import these
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:id', getUserProfile);
router.post('/watchlist', protect, addToWatchlist);
router.delete('/watchlist/:movieId', protect, removeFromWatchlist);
router.post('/follow', protect, followTarget);
router.post('/unfollow', protect, unfollowTarget);

// NEW ROUTES
router.post('/seen/movie', protect, markMovieSeen);
router.post('/seen/tv', protect, markTVSeen);

export default router;