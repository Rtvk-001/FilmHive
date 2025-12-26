# FilmHive (MERN)

Fast movie logging app inspired by Letterboxd. Tech: MongoDB, Express, React, Node, Vite, Tailwind.

## Setup
1) Install deps
- Server: `cd server && npm install`
- Client: `cd client && npm install`

2) Env
- Copy `server/env.sample` to `.env` and fill `MONGODB_URI`, `JWT_SECRET`, `TMDB_API_KEY`, `PORT` (optional).
- Copy `client/env.sample` to `.env` and adjust `VITE_API_URL` if your API runs elsewhere.

3) Run
- API: `cd server && npm run dev` (nodemon on port 5000 by default)
- Web: `cd client && npm run dev` (Vite on port 5173)

## Features
- Email/password auth (JWT)
- Search movies via TMDB and log watches with rating/review
- Recent activity + basic stats (totals, avg rating, top genres)
- Mongo-backed storage for users, movies, and logs

## Notes
- You need a free TMDB API key: https://www.themoviedb.org/settings/api (use v3 API key)
- Update `VITE_API_URL` if running the API on a different port/host.


