import { BALANCE } from '../config/balance'
import { BY_RARITY } from '../config/characters'
import { getAccountLevel } from './xpCalc'

const getRarityWeights = (totalXp) => {
  const accountLevel = getAccountLevel(totalXp)
  let { common, uncommon, rare, legendary } = BALANCE.pull.rates

  let bonus = 0
  for (const b of BALANCE.pull.accountLevelBonuses) {
    if (accountLevel >= b.level) bonus = b.rarePullBonus
  }

  rare += bonus
  legendary += bonus / 2
  const total = common + uncommon + rare + legendary
  return {
    common: common / total,
    uncommon: uncommon / total,
    rare: rare / total,
    legendary: legendary / total,
  }
}

const pickRarity = (weights) => {
  const roll = Math.random()
  let cumulative = 0
  for (const [rarity, weight] of Object.entries(weights)) {
    cumulative += weight
    if (roll < cumulative) return rarity
  }
  return 'common'
}

export const attemptPull = (ownedIds, totalXp) => {
  if (Math.random() < BALANCE.pull.missChance) return null

  const weights = getRarityWeights(totalXp)
  const rarity = pickRarity(weights)
  const pool = BY_RARITY[rarity].filter(id => !ownedIds.includes(id))

  if (pool.length === 0) {
    const allUnowned = Object.values(BY_RARITY).flat().filter(id => !ownedIds.includes(id))
    if (allUnowned.length === 0) return null
    return allUnowned[Math.floor(Math.random() * allUnowned.length)]
  }

  return pool[Math.floor(Math.random() * pool.length)]
}
