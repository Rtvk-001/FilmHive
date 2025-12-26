import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';
import logRoutes from './routes/logs.js';
import statsRoutes from './routes/stats.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/stats', statsRoutes);

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

connectDB(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => console.log(`API running on port ${port}`));
  })
  .catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });


