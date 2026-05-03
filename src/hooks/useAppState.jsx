import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { storage } from '../utils/storage'
import { SEED_CHORES } from '../utils/seedData'
import { nanoid } from '../utils/nanoid'
import { applyHappinessDecay } from '../utils/happinessCalc'
import { applyXpToCharacter, calcXpEarned, calcCoinsEarned, getAccountLevel } from '../utils/xpCalc'
import { attemptPull } from '../utils/pullSystem'
import { BALANCE, SHOP_ITEMS } from '../config/balance'
import { CHARACTERS } from '../config/characters'

const AppContext = createContext(null)

const makeCharacterEntry = (id) => ({
  id,
  level: 1,
  xp: 0,
  evolutionStage: 0,
  happiness: 80,
  lastInteractionDate: new Date().toISOString().split('T')[0],
  nickname: null,
})

const today = () => new Date().toISOString().split('T')[0]

export const AppProvider = ({ children }) => {
  const [kid, setKidState] = useState(() => storage.getKid())
  const [characters, setCharactersState] = useState(() => applyHappinessDecay(storage.getCharacters()))
  const [activeCharacterId, setActiveCharacterIdState] = useState(() => storage.getActiveCharacter())
  const [chores, setChoresState] = useState(() => {
    const stored = storage.getChores()
    return stored.length ? stored : SEED_CHORES
  })
  const [completions, setCompletionsState] = useState(() => storage.getCompletions())
  const [pendingCompletions, setPendingCompletionsState] = useState(() => storage.getPendingCompletions())
  const [recentApprovals, setRecentApprovalsState] = useState(() => storage.getRecentApprovals())
  const [streaks, setStreaksState] = useState(() => storage.getStreaks())
  const [photoQueue, setPhotoQueueState] = useState(() => storage.getPhotoQueue())
  const [settings, setSettingsState] = useState(() => storage.getSettings())
  const [purchaseHistory, setPurchaseHistoryState] = useState(() => storage.getPurchaseHistory())
  const [customRewards, setCustomRewardsState] = useState(() => storage.getCustomRewards())
  const [rewardRedemptions, setRewardRedemptionsState] = useState(() => storage.getRewardRedemptions())

  useEffect(() => { storage.setKid(kid) }, [kid])
  useEffect(() => { storage.setCharacters(characters) }, [characters])
  useEffect(() => { storage.setActiveCharacter(activeCharacterId) }, [activeCharacterId])
  useEffect(() => { storage.setChores(chores) }, [chores])
  useEffect(() => { storage.setCompletions(completions) }, [completions])
  useEffect(() => { storage.setPendingCompletions(pendingCompletions) }, [pendingCompletions])
  useEffect(() => { storage.setRecentApprovals(recentApprovals) }, [recentApprovals])
  useEffect(() => { storage.setStreaks(streaks) }, [streaks])
  useEffect(() => { storage.setPhotoQueue(photoQueue) }, [photoQueue])
  useEffect(() => { storage.setSettings(settings) }, [settings])
  useEffect(() => { storage.setPurchaseHistory(purchaseHistory) }, [purchaseHistory])
  useEffect(() => { storage.setCustomRewards(customRewards) }, [customRewards])
  useEffect(() => { storage.setRewardRedemptions(rewardRedemptions) }, [rewardRedemptions])

  const activeCharacter = characters.find(c => c.id === activeCharacterId) ?? null

  // Chore IDs locked today (pending or approved — rejected allows retry)
  const lockedChoreIds = new Set(
    pendingCompletions
      .filter(p => p.submittedAt.startsWith(today()) && p.status !== 'rejected')
      .map(p => p.choreId)
  )

  // ─── Setup ────────────────────────────────────────────────────────────────

  const setupKid = useCallback((name, starterId) => {
    setKidState({ name, totalXpEarned: 0, coins: 0, accountLevel: 0 })
    setCharactersState([makeCharacterEntry(starterId)])
    setActiveCharacterIdState(starterId)
    setSettingsState(s => ({ ...s, isFirstRun: false }))
    if (!storage.getChores().length) setChoresState(SEED_CHORES)
  }, [])

  // ─── Chores ───────────────────────────────────────────────────────────────

  const addChore = useCallback((chore) => {
    setChoresState(prev => [...prev, { ...chore, id: nanoid() }])
  }, [])

  const updateChore = useCallback((id, updates) => {
    setChoresState(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }, [])

  const deleteChore = useCallback((id) => {
    setChoresState(prev => prev.filter(c => c.id !== id))
  }, [])

  // ─── Submit Chore (creates pending — no rewards yet) ─────────────────────

  const completeChore = useCallback((choreId, timeTaken) => {
    const chore = chores.find(c => c.id === choreId)
    if (!chore || !activeCharacterId) return null
    if (lockedChoreIds.has(choreId)) return null

    const beatTimer = timeTaken <= chore.estimatedMinutes * 60

    const streakActive = (() => {
      const last = streaks.lastCompletionDate
      if (!last) return false
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return streaks.currentStreak >= BALANCE.streakThresholdDays - 1 && last === yesterday.toISOString().split('T')[0]
    })()

    const char = characters.find(c => c.id === activeCharacterId)
    const xp = calcXpEarned(chore.difficulty, beatTimer, streakActive, char?.happiness ?? 80)
    const coins = calcCoinsEarned(chore.difficulty, beatTimer, streakActive)

    const entry = {
      id: nanoid(),
      choreId,
      choreName: chore.name,
      choreEmoji: chore.emoji,
      characterId: activeCharacterId,
      timeTaken,
      beatTimer,
      streakActive,
      xp,
      coins,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    }

    setPendingCompletionsState(prev => [...prev, entry])
    return { xp, coins, beatTimer, streakActive }
  }, [chores, activeCharacterId, characters, streaks, lockedChoreIds])

  // ─── Approve Chore (parent action — awards rewards) ──────────────────────

  const approveCompletion = useCallback((pendingId) => {
    const pending = pendingCompletions.find(p => p.id === pendingId)
    if (!pending) return

    const char = characters.find(c => c.id === pending.characterId)
    if (!char) return

    const t = today()
    const updated = applyXpToCharacter(char, pending.xp)
    const evolved = updated.evolved
    delete updated.evolved
    updated.happiness = Math.min(BALANCE.happiness.max, (updated.happiness ?? 80) + 5)
    updated.lastInteractionDate = t

    setCharactersState(prev => prev.map(c => c.id === pending.characterId ? updated : c))

    setKidState(prev => {
      const totalXpEarned = prev.totalXpEarned + pending.xp
      return { ...prev, coins: prev.coins + pending.coins, totalXpEarned, accountLevel: getAccountLevel(totalXpEarned) }
    })

    setStreaksState(prev => {
      const last = prev.lastCompletionDate
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yStr = yesterday.toISOString().split('T')[0]
      const newStreak = last === t ? prev.currentStreak : last === yStr ? prev.currentStreak + 1 : 1
      return { currentStreak: newStreak, lastCompletionDate: t }
    })

    setCompletionsState(prev => [...prev, {
      id: nanoid(),
      choreId: pending.choreId,
      characterId: pending.characterId,
      timestamp: new Date().toISOString(),
      timeTaken: pending.timeTaken,
      pointsEarned: pending.xp,
      coinsEarned: pending.coins,
      bonusApplied: pending.beatTimer,
    }])

    setPendingCompletionsState(prev => prev.map(p => p.id === pendingId ? { ...p, status: 'approved' } : p))

    // Store reward notification for kid
    setRecentApprovalsState(prev => [...prev, {
      id: nanoid(),
      choreName: pending.choreName,
      choreEmoji: pending.choreEmoji,
      xp: pending.xp,
      coins: pending.coins,
      beatTimer: pending.beatTimer,
      evolved,
      newLevel: updated.level,
      evolutionStage: updated.evolutionStage,
      characterId: pending.characterId,
      approvedAt: new Date().toISOString(),
    }])
  }, [pendingCompletions, characters])

  const rejectCompletion = useCallback((pendingId) => {
    setPendingCompletionsState(prev => prev.map(p => p.id === pendingId ? { ...p, status: 'rejected' } : p))
  }, [])

  const dismissApproval = useCallback((approvalId) => {
    setRecentApprovalsState(prev => prev.filter(a => a.id !== approvalId))
  }, [])

  // ─── Shop ─────────────────────────────────────────────────────────────────

  const buyItem = useCallback((itemId) => {
    const item = SHOP_ITEMS[itemId]
    if (!item || !kid || kid.coins < item.cost) return false
    setKidState(prev => ({ ...prev, coins: prev.coins - item.cost }))
    setCharactersState(prev => prev.map(c =>
      c.id === activeCharacterId
        ? { ...c, happiness: Math.min(BALANCE.happiness.max, c.happiness + item.happinessBoost) }
        : c
    ))
    setPurchaseHistoryState(prev => [...prev, { itemId, characterId: activeCharacterId, purchasedAt: new Date().toISOString(), coinsSpent: item.cost }])
    return true
  }, [kid, activeCharacterId])

  // ─── Photo Queue ──────────────────────────────────────────────────────────

  const submitPhoto = useCallback((photoDataUrl) => {
    const t = today()
    if (settings.lastPhotoSubmissionDate === t) return false
    const entry = { id: nanoid(), photoDataUrl, submittedAt: new Date().toISOString(), status: 'pending', pullResult: null }
    setPhotoQueueState(prev => [...prev, entry])
    setSettingsState(prev => ({ ...prev, lastPhotoSubmissionDate: t }))
    return true
  }, [settings.lastPhotoSubmissionDate])

  const approvePhoto = useCallback((photoId) => {
    const ownedIds = characters.map(c => c.id)
    const pulledId = attemptPull(ownedIds, kid?.totalXpEarned ?? 0)
    setPhotoQueueState(prev => prev.map(p =>
      p.id === photoId ? { ...p, status: 'approved', pullResult: pulledId } : p
    ))
    return pulledId
  }, [characters, kid])

  const claimPhotoReward = useCallback((photoId) => {
    const photo = photoQueue.find(p => p.id === photoId)
    if (!photo || photo.status !== 'approved' || photo.claimed) return
    if (photo.pullResult) {
      setCharactersState(prev => [...prev, makeCharacterEntry(photo.pullResult)])
    } else {
      setKidState(prev => ({ ...prev, coins: prev.coins + BALANCE.cleanRoomCoins }))
    }
    setPhotoQueueState(prev => prev.map(p =>
      p.id === photoId ? { ...p, claimed: true, photoDataUrl: null } : p
    ))
  }, [photoQueue])

  const rejectPhoto = useCallback((photoId) => {
    setPhotoQueueState(prev => prev.map(p =>
      p.id === photoId ? { ...p, status: 'rejected', photoDataUrl: null } : p
    ))
  }, [])

  // ─── Character Management ─────────────────────────────────────────────────

  const setActiveCharacter = useCallback((id) => {
    if (characters.find(c => c.id === id)) setActiveCharacterIdState(id)
  }, [characters])

  const renameCharacter = useCallback((id, nickname) => {
    setCharactersState(prev => prev.map(c => c.id === id ? { ...c, nickname } : c))
  }, [])

  const updateSettings = useCallback((updates) => {
    setSettingsState(prev => ({ ...prev, ...updates }))
  }, [])

  // ─── Custom Rewards ───────────────────────────────────────────────────────

  const addCustomReward = useCallback((reward) => {
    setCustomRewardsState(prev => [...prev, { ...reward, id: nanoid(), createdAt: new Date().toISOString() }])
  }, [])

  const deleteCustomReward = useCallback((id) => {
    setCustomRewardsState(prev => prev.filter(r => r.id !== id))
  }, [])

  const redeemCustomReward = useCallback((rewardId) => {
    const reward = customRewards.find(r => r.id === rewardId)
    if (!reward || !kid || kid.coins < reward.coinCost) return false
    setKidState(prev => ({ ...prev, coins: prev.coins - reward.coinCost }))
    setRewardRedemptionsState(prev => [...prev, {
      id: nanoid(),
      rewardId,
      rewardName: reward.name,
      rewardEmoji: reward.emoji,
      rewardDescription: reward.description,
      coinCost: reward.coinCost,
      purchasedAt: new Date().toISOString(),
      status: 'pending',
    }])
    return true
  }, [customRewards, kid])

  const fulfillRedemption = useCallback((redemptionId) => {
    setRewardRedemptionsState(prev => prev.map(r => r.id === redemptionId ? { ...r, status: 'fulfilled' } : r))
  }, [])

  const rejectRedemption = useCallback((redemptionId) => {
    const redemption = rewardRedemptions.find(r => r.id === redemptionId)
    if (!redemption) return
    // Refund coins
    setKidState(prev => ({ ...prev, coins: prev.coins + redemption.coinCost }))
    setRewardRedemptionsState(prev => prev.map(r => r.id === redemptionId ? { ...r, status: 'rejected' } : r))
  }, [rewardRedemptions])

  const pendingPhotoCount = photoQueue.filter(p => p.status === 'pending').length
  const pendingChoreCount = pendingCompletions.filter(p => p.status === 'pending').length
  const unclaimedPhoto = photoQueue.find(p => p.status === 'approved' && !p.claimed) ?? null
  const latestApproval = recentApprovals[0] ?? null
  const pendingRedemptionCount = rewardRedemptions.filter(r => r.status === 'pending').length

  return (
    <AppContext.Provider value={{
      kid, characters, activeCharacterId, activeCharacter,
      chores, completions, pendingCompletions, recentApprovals, latestApproval,
      streaks, photoQueue, settings, purchaseHistory,
      customRewards, rewardRedemptions,
      lockedChoreIds, pendingPhotoCount, pendingChoreCount, pendingRedemptionCount, unclaimedPhoto,
      setupKid, addChore, updateChore, deleteChore,
      completeChore, approveCompletion, rejectCompletion, dismissApproval,
      buyItem,
      submitPhoto, approvePhoto, rejectPhoto, claimPhotoReward,
      setActiveCharacter, renameCharacter, updateSettings,
      addCustomReward, deleteCustomReward, redeemCustomReward, fulfillRedemption, rejectRedemption,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppState = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used within AppProvider')
  return ctx
}
