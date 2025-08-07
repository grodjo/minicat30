import mongoose from 'mongoose'

// User Schema
const UserSchema = new mongoose.Schema({
  pseudo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// GameSession Schema
const GameSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startedAt: {
    type: Date,
    required: true,
  },
  completedAt: {
    type: Date,
  },
})

// Attempt Schema
const AttemptSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameSession',
    required: true,
  },
  questionId: {
    type: String,
    required: true,
  },
  startedAt: {
    type: Date,
    required: true,
  },
  answeredAt: {
    type: Date,
  },
  usedHints: {
    type: String, // JSON array
    default: '[]',
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
})

// Export models
export const User = mongoose.models.User || mongoose.model('User', UserSchema)
export const GameSession = mongoose.models.GameSession || mongoose.model('GameSession', GameSessionSchema)
export const Attempt = mongoose.models.Attempt || mongoose.model('Attempt', AttemptSchema)
