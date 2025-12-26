import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user
      req.user = await User.findById(decoded.id).select('-password');

      // CRITICAL FIX: Check if user was actually found
      if (!req.user) {
        return res.status(401).json({ message: 'Token valid, but user not found in DB' });
      }

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};