import { BALANCE } from '../config/balance'

const daysBetween = (dateA, dateB) => {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.floor((new Date(dateA) - new Date(dateB)) / msPerDay)
}

export const applyHappinessDecay = (characters) => {
  const today = new Date().toISOString().split('T')[0]
  return characters.map(char => {
    if (!char.lastInteractionDate) return char
    const days = daysBetween(today, char.lastInteractionDate)
    if (days <= 0) return char
    const decay = days * BALANCE.happiness.decayPerDay
    return { ...char, happiness: Math.max(0, char.happiness - decay) }
  })
}

export const getHappinessTier = (happiness) => {
  if (happiness >= BALANCE.happiness.happyThreshold) return 'happy'
  if (happiness >= BALANCE.happiness.sadThreshold) return 'content'
  return 'sad'
}

export const getHappinessColor = (happiness) => {
  if (happiness >= BALANCE.happiness.happyThreshold) return 'text-green-500'
  if (happiness >= BALANCE.happiness.sadThreshold) return 'text-yellow-500'
  return 'text-red-500'
}

export const getHappinessBarColor = (happiness) => {
  if (happiness >= BALANCE.happiness.happyThreshold) return 'bg-green-400'
  if (happiness >= BALANCE.happiness.sadThreshold) return 'bg-yellow-400'
  return 'bg-red-400'
}
