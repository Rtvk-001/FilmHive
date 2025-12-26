import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js'; // <--- 1. IMPORT THIS
import searchRoutes from './routes/searchRoutes.js';
dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // <--- 2. ADD THIS LINE
app.use('/api/search', searchRoutes);
app.get('/', (req, res) => {
  res.send('FilmHive API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});