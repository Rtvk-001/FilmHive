import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  
  // Stats
  moviesWatched: { type: Number, default: 0 },
  tvShowsWatched: { type: Number, default: 0 }, // NEW
  episodesWatched: { type: Number, default: 0 }, // NEW
  totalRuntime: { type: Number, default: 0 },
  
  // Lists
  watchlist: [{
    movieId: String,
    title: String,
    posterPath: String,
    addedAt: { type: Date, default: Date.now }
  }],

  // NEW: History
  watchedMovies: [{
    movieId: String,
    title: String,
    posterPath: String,
    seenAt: { type: Date, default: Date.now }
  }],

  watchedTV: [{
    tvId: String,
    name: String,
    posterPath: String,
    seenAt: { type: Date, default: Date.now }
  }],

  // Social & Activity
  following: [{
    id: String,
    name: String,
    image: String,
    type: { type: String, enum: ['user', 'person'], default: 'person' }
  }],
  
  followers: [{
    userId: String,
    username: String,
    profilePicture: String
  }],

  activityLog: [{
    type: { type: String },
    content: String,
    targetId: String,
    image: String,
    rating: Number,
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
});
// Helper: Check if entered password matches hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware: Encrypt password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;