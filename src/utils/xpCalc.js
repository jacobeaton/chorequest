import { BALANCE } from '../config/balance'

export const getHappinessMultiplier = (happiness) => {
  if (happiness >= BALANCE.happiness.happyThreshold) return BALANCE.happiness.happyXpBonus
  if (happiness >= BALANCE.happiness.sadThreshold) return 1.0
  return BALANCE.happiness.sadXpPenalty
}

export const calcXpEarned = (difficulty, beatTimer, streakActive, happiness) => {
  let xp = BALANCE.xp[difficulty]
  if (beatTimer) xp = Math.floor(xp * BALANCE.timerBonusMultiplier)
  if (streakActive) xp = Math.floor(xp * BALANCE.streakMultiplier)
  xp = Math.floor(xp * getHappinessMultiplier(happiness))
  return xp
}

export const calcCoinsEarned = (difficulty, beatTimer, streakActive) => {
  let coins = BALANCE.coins[difficulty]
  if (beatTimer) coins = Math.floor(coins * BALANCE.timerBonusMultiplier)
  if (streakActive) coins = Math.floor(coins * BALANCE.streakMultiplier)
  return coins
}

export const getAccountLevel = (totalXp) =>
  Math.floor(totalXp / BALANCE.accountXpPerLevel)

export const applyXpToCharacter = (character, xpGained) => {
  const { xpPerLevel, maxLevel, evolutionLevels } = BALANCE
  let { level, xp, evolutionStage } = character

  if (level >= maxLevel) return { ...character, xp: xpPerLevel - 1, evolved: false }

  xp += xpGained
  let evolved = false
  let newLevel = level

  while (xp >= xpPerLevel && newLevel < maxLevel) {
    xp -= xpPerLevel
    newLevel++
    if (evolutionLevels.includes(newLevel)) {
      evolutionStage = evolutionLevels.indexOf(newLevel) + 1
      evolved = true
    }
  }

  if (newLevel >= maxLevel) xp = Math.min(xp, xpPerLevel - 1)

  return { ...character, level: newLevel, xp, evolutionStage, evolved }
}
