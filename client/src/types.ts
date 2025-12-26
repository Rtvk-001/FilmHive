export type Movie = {
  _id?: string;
  tmdbId: string;
  title: string;
  year?: string;
  poster?: string;
  runtime?: string;
  genre?: string;
};

export type LogEntry = {
  _id: string;
  movie: Movie;
  rating?: number;
  review?: string;
  watchedOn?: string;
  rewatch?: boolean;
  createdAt: string;
};


