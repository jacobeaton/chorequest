import { nanoid } from './nanoid'

export const SEED_CHORES = [
  { id: nanoid(), name: 'Make Bed', emoji: '🛏️', estimatedMinutes: 5,  points: 10, coins: 5,  difficulty: 'easy',   createdBy: 'parent' },
  { id: nanoid(), name: 'Tidy Room', emoji: '🧹', estimatedMinutes: 15, points: 25, coins: 12, difficulty: 'medium', createdBy: 'parent' },
  { id: nanoid(), name: 'Empty Dishwasher', emoji: '🍽️', estimatedMinutes: 10, points: 25, coins: 12, difficulty: 'medium', createdBy: 'parent' },
  { id: nanoid(), name: 'Vacuum Living Room', emoji: '🌀', estimatedMinutes: 20, points: 50, coins: 25, difficulty: 'hard',   createdBy: 'parent' },
  { id: nanoid(), name: 'Take Out Trash', emoji: '🗑️', estimatedMinutes: 5,  points: 10, coins: 5,  difficulty: 'easy',   createdBy: 'parent' },
  { id: nanoid(), name: 'Clean Bathroom Sink', emoji: '🚿', estimatedMinutes: 8,  points: 10, coins: 5,  difficulty: 'easy',   createdBy: 'parent' },
]
