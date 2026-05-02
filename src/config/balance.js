export const BALANCE = {
  xp: { easy: 10, medium: 25, hard: 50 },
  coins: { easy: 5, medium: 12, hard: 25 },
  timerBonusMultiplier: 1.5,
  streakMultiplier: 2.0,
  streakThresholdDays: 3,
  xpPerLevel: 100,
  maxLevel: 30,
  evolutionLevels: [15, 30],

  happiness: {
    max: 100,
    decayPerDay: 10,
    fromFood: 15,
    fromToy: 25,
    happyThreshold: 80,
    sadThreshold: 50,
    happyXpBonus: 1.2,
    sadXpPenalty: 0.8,
  },

  pull: {
    missChance: 0.40,
    rates: {
      common: 0.60,
      uncommon: 0.25,
      rare: 0.12,
      legendary: 0.03,
    },
    accountLevelBonuses: [
      { level: 10, rarePullBonus: 0.02 },
      { level: 25, rarePullBonus: 0.04 },
      { level: 50, rarePullBonus: 0.07 },
    ],
  },

  accountXpPerLevel: 500,
}

export const SHOP_ITEMS = {
  apple:   { id: 'apple',   name: 'Apple',      emoji: '🍎', cost: 8,  happinessBoost: 10, type: 'food' },
  cookie:  { id: 'cookie',  name: 'Cookie',     emoji: '🍪', cost: 5,  happinessBoost: 8,  type: 'food' },
  pizza:   { id: 'pizza',   name: 'Pizza Slice', emoji: '🍕', cost: 20, happinessBoost: 25, type: 'food' },
  cake:    { id: 'cake',    name: 'Birthday Cake', emoji: '🎂', cost: 35, happinessBoost: 40, type: 'food' },
  ball:    { id: 'ball',    name: 'Bouncy Ball', emoji: '⚽', cost: 30, happinessBoost: 20, type: 'toy' },
  frisbee: { id: 'frisbee', name: 'Frisbee',    emoji: '🥏', cost: 25, happinessBoost: 18, type: 'toy' },
  plushie: { id: 'plushie', name: 'Plushie',    emoji: '🧸', cost: 50, happinessBoost: 35, type: 'toy' },
  game:    { id: 'game',    name: 'Mini Game',  emoji: '🎮', cost: 60, happinessBoost: 45, type: 'toy' },
}
