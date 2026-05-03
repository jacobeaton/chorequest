import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { storage } from '../utils/storage'
import { SEED_CHORES } from '../utils/seedData'
import { nanoid } from '../utils/nanoid'
import { applyHappinessDecay } from '../utils/happinessCalc'
import { applyXpToCharacter, calcXpEarned, calcCoinsEarned, getAccountLevel } from '../utils/xpCalc'
import { attemptPull } from '../utils/pullSystem'
import { BALANCE, SHOP_ITEMS } from '../config/balance'
import { CHARACTERS } from '../config/characters'
import { useAuth } from './useAuth'
import * as db from '../lib/db'
import { localToday, localDateOf } from '../utils/dateUtils'

const AppContext = createContext(null)

const makeCharacterEntry = (id) => ({
  id,
  level: 1,
  xp: 0,
  evolutionStage: 0,
  happiness: 80,
  lastInteractionDate: localToday(),
  nickname: null,
})

const today = localToday

export const AppProvider = ({ children }) => {
  const { deviceKidId, parentSettings, session, updateParentSettings, refreshKids } = useAuth()

  const kidId = deviceKidId && deviceKidId !== 'parent' ? deviceKidId : null
  const parentId = session?.user?.id

  // ─── Local state (localStorage cache) ────────────────────────────────────────

  const [kid, setKidState] = useState(() => storage.getKid())
  const [characters, setCharactersState] = useState(() => applyHappinessDecay(storage.getCharacters()))
  const [activeCharacterId, setActiveCharacterIdState] = useState(() => storage.getActiveCharacter())
  const [chores, setChoresState] = useState(() => storage.getChores())
  const [completions, setCompletionsState] = useState(() => storage.getCompletions())
  const [pendingCompletions, setPendingCompletionsState] = useState(() => storage.getPendingCompletions())
  const [recentApprovals, setRecentApprovalsState] = useState(() => storage.getRecentApprovals())
  const [streaks, setStreaksState] = useState(() => storage.getStreaks())
  const [photoQueue, setPhotoQueueState] = useState(() => storage.getPhotoQueue())
  const [settings, setSettingsState] = useState(() => storage.getSettings())
  const [purchaseHistory, setPurchaseHistoryState] = useState(() => storage.getPurchaseHistory())
  const [customRewards, setCustomRewardsState] = useState(() => storage.getCustomRewards())
  const [rewardRedemptions, setRewardRedemptionsState] = useState(() => storage.getRewardRedemptions())

  // ─── Sync to localStorage ─────────────────────────────────────────────────────

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

  // ─── Load from Supabase on mount ──────────────────────────────────────────────

  useEffect(() => {
    if (!parentId) return
    if (!kidId) {
      // Parent device: load chores and custom rewards (shared across family)
      Promise.all([db.getChores(), db.getCustomRewards()]).then(([choresData, rewardsData]) => {
        if (choresData.length) setChoresState(choresData)
        setCustomRewardsState(rewardsData)
      }).catch(console.error)
      return
    }

    // Kid device: load all kid-specific data from Supabase
    Promise.all([
      db.getKidById(kidId),
      db.getKidCharacters(kidId),
      db.getChores(),
      db.getPendingCompletions(kidId),
      db.getPhotoQueue(kidId),
      db.getCustomRewards(),
      db.getRewardRedemptions(kidId),
      db.getKidNotifications(kidId),
    ]).then(async ([kidRow, chars, choresData, pending, photos, rewards, redemptions, notifications]) => {
      if (kidRow) {
        setKidState({ name: kidRow.name, totalXpEarned: kidRow.totalXpEarned, coins: kidRow.coins, accountLevel: kidRow.accountLevel })
        setActiveCharacterIdState(kidRow.activeCharacterId ?? activeCharacterId)
        setStreaksState({ currentStreak: kidRow.currentStreak, lastCompletionDate: kidRow.lastCompletionDate })
        setSettingsState(prev => ({ ...prev, lastPhotoSubmissionDate: kidRow.lastPhotoSubmissionDate }))
      }
      if (chars.length) setCharactersState(applyHappinessDecay(chars))
      if (choresData.length) setChoresState(choresData)
      if (pending.length) setPendingCompletionsState(pending)
      if (rewards.length) setCustomRewardsState(rewards)
      if (redemptions.length) setRewardRedemptionsState(redemptions)

      // Load signed URLs for approved unclaimed photos
      const photosWithUrls = await Promise.all(photos.map(async p => ({
        ...p,
        photoDataUrl: (!p.claimed && p.photoPath) ? await db.getPhotoUrl(p.photoPath).catch(() => null) : (p.photoDataUrl ?? null),
      })))
      if (photos.length) setPhotoQueueState(photosWithUrls)

      // Convert notifications to recentApprovals
      const approvals = notifications
        .filter(n => n.type === 'chore_approved')
        .map(n => ({ ...n.payload, id: n.id, approvedAt: n.createdAt }))
      if (approvals.length) setRecentApprovalsState(approvals)
    }).catch(console.error)
  }, [kidId, parentId])

  // ─── Realtime: kid notifications ──────────────────────────────────────────────

  useEffect(() => {
    if (!kidId) return
    const unsub = db.subscribeToKidNotifications(kidId, (notif) => {
      if (notif.type === 'chore_approved') {
        const approval = { ...notif.payload, id: notif.id, approvedAt: notif.createdAt }
        setRecentApprovalsState(prev => [approval, ...prev])
        // Refresh kid data from Supabase to get updated XP/coins
        db.getKidById(kidId).then(kidRow => {
          if (kidRow) {
            setKidState({ name: kidRow.name, totalXpEarned: kidRow.totalXpEarned, coins: kidRow.coins, accountLevel: kidRow.accountLevel })
            setStreaksState({ currentStreak: kidRow.currentStreak, lastCompletionDate: kidRow.lastCompletionDate })
          }
        }).catch(console.error)
        db.getKidCharacters(kidId).then(chars => {
          if (chars.length) setCharactersState(applyHappinessDecay(chars))
        }).catch(console.error)
        setPendingCompletionsState(prev => prev.map(p =>
          p.characterId === notif.payload.characterId ? { ...p, status: 'approved' } : p
        ))
      }
    })
    return unsub
  }, [kidId])

  // ─── Merged settings (parentSettings + local) ────────────────────────────────

  const mergedSettings = useMemo(() => ({
    ...settings,
    parentPin: parentSettings?.pin ?? settings.parentPin,
    soundOn: parentSettings?.soundOn ?? settings.soundOn,
  }), [settings, parentSettings])

  const activeCharacter = characters.find(c => c.id === activeCharacterId) ?? null

  const lockedChoreIds = new Set(
    pendingCompletions
      .filter(p => p.submittedAt && localDateOf(p.submittedAt) === today() && p.status !== 'rejected')
      .map(p => p.choreId)
  )

  // ─── Setup ────────────────────────────────────────────────────────────────────

  const setupKid = useCallback((name, starterId) => {
    const newChar = makeCharacterEntry(starterId)
    setKidState({ name, totalXpEarned: 0, coins: 0, accountLevel: 0 })
    setCharactersState([newChar])
    setActiveCharacterIdState(starterId)
    setSettingsState(s => ({ ...s, isFirstRun: false }))
    if (!storage.getChores().length) setChoresState(SEED_CHORES)

    // Sync character to Supabase if kid already exists
    if (kidId) {
      Promise.all([
        db.upsertKidCharacter(kidId, newChar),
        db.updateKid(kidId, { activeCharacterId: starterId }),
      ]).catch(console.error)
    }
  }, [kidId])

  // ─── Chores ───────────────────────────────────────────────────────────────────

  const addChore = useCallback((chore) => {
    const newChore = { ...chore, id: nanoid() }
    setChoresState(prev => [...prev, newChore])
    if (parentId) {
      db.insertChore(parentId, newChore).then(dbChore => {
        // Replace local entry with Supabase entry (which has proper UUID)
        setChoresState(prev => prev.map(c => c.id === newChore.id ? dbChore : c))
      }).catch(console.error)
    }
  }, [parentId])

  const updateChore = useCallback((id, updates) => {
    setChoresState(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    if (parentId) db.updateChoreDb(id, updates).catch(console.error)
  }, [parentId])

  const deleteChore = useCallback((id) => {
    setChoresState(prev => prev.filter(c => c.id !== id))
    if (parentId) db.deleteChoreDb(id).catch(console.error)
  }, [parentId])

  // ─── Submit Chore ─────────────────────────────────────────────────────────────

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
      return streaks.currentStreak >= BALANCE.streakThresholdDays - 1 && last === localDateOf(yesterday)
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

    if (kidId) {
      db.insertPendingCompletion(kidId, entry).catch(console.error)
    }

    return { xp, coins, beatTimer, streakActive }
  }, [chores, activeCharacterId, characters, streaks, lockedChoreIds, kidId])

  // ─── Approve Chore ────────────────────────────────────────────────────────────

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

    const newTotalXp = (kid?.totalXpEarned ?? 0) + pending.xp
    const newCoins = (kid?.coins ?? 0) + pending.coins
    const newAccountLevel = getAccountLevel(newTotalXp)

    const last = streaks.lastCompletionDate
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = localDateOf(yesterday)
    const newStreak = last === t ? streaks.currentStreak : last === yStr ? streaks.currentStreak + 1 : 1

    setCharactersState(prev => prev.map(c => c.id === pending.characterId ? updated : c))
    setKidState(prev => ({ ...prev, coins: newCoins, totalXpEarned: newTotalXp, accountLevel: newAccountLevel }))
    setStreaksState({ currentStreak: newStreak, lastCompletionDate: t })
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

    // Supabase sync
    const targetKidId = pending.kidId ?? kidId
    if (targetKidId) {
      Promise.all([
        db.updatePendingCompletion(pendingId, { status: 'approved' }),
        db.upsertKidCharacter(targetKidId, updated),
        db.insertCompletion(targetKidId, {
          choreId: pending.choreId,
          characterId: pending.characterId,
          timeTaken: pending.timeTaken,
          pointsEarned: pending.xp,
          coinsEarned: pending.coins,
          bonusApplied: pending.beatTimer,
        }),
        db.updateKid(targetKidId, {
          coins: newCoins,
          totalXpEarned: newTotalXp,
          accountLevel: newAccountLevel,
          currentStreak: newStreak,
          lastCompletionDate: t,
        }),
        db.insertKidNotification(targetKidId, 'chore_approved', {
          choreName: pending.choreName,
          choreEmoji: pending.choreEmoji,
          xp: pending.xp,
          coins: pending.coins,
          beatTimer: pending.beatTimer,
          evolved,
          newLevel: updated.level,
          evolutionStage: updated.evolutionStage,
          characterId: pending.characterId,
        }),
      ]).catch(console.error)
    }
  }, [pendingCompletions, characters, kid, streaks, kidId])

  const rejectCompletion = useCallback((pendingId) => {
    setPendingCompletionsState(prev => prev.map(p => p.id === pendingId ? { ...p, status: 'rejected' } : p))
    if (kidId) db.updatePendingCompletion(pendingId, { status: 'rejected' }).catch(console.error)
  }, [kidId])

  const dismissApproval = useCallback((approvalId) => {
    setRecentApprovalsState(prev => prev.filter(a => a.id !== approvalId))
    db.dismissKidNotification(approvalId).catch(console.error)
  }, [])

  // ─── Shop ─────────────────────────────────────────────────────────────────────

  const buyItem = useCallback((itemId) => {
    const item = SHOP_ITEMS[itemId]
    if (!item || !kid || kid.coins < item.cost) return false

    const newCoins = kid.coins - item.cost
    setKidState(prev => ({ ...prev, coins: newCoins }))
    setCharactersState(prev => prev.map(c =>
      c.id === activeCharacterId
        ? { ...c, happiness: Math.min(BALANCE.happiness.max, c.happiness + item.happinessBoost) }
        : c
    ))
    setPurchaseHistoryState(prev => [...prev, { itemId, characterId: activeCharacterId, purchasedAt: new Date().toISOString(), coinsSpent: item.cost }])

    if (kidId) {
      const updatedChar = characters.find(c => c.id === activeCharacterId)
      if (updatedChar) {
        const newChar = { ...updatedChar, happiness: Math.min(BALANCE.happiness.max, updatedChar.happiness + item.happinessBoost) }
        Promise.all([
          db.updateKid(kidId, { coins: newCoins }),
          db.upsertKidCharacter(kidId, newChar),
        ]).catch(console.error)
      }
    }
    return true
  }, [kid, activeCharacterId, characters, kidId])

  // ─── Photo Queue ──────────────────────────────────────────────────────────────

  const submitPhoto = useCallback(async (photoDataUrl) => {
    const t = today()
    if (settings.lastPhotoSubmissionDate === t) return false

    const entry = { id: nanoid(), photoDataUrl, submittedAt: new Date().toISOString(), status: 'pending', pullResult: null }
    setPhotoQueueState(prev => [...prev, entry])
    setSettingsState(prev => ({ ...prev, lastPhotoSubmissionDate: t }))

    if (kidId) {
      try {
        const photoPath = await db.uploadPhoto(kidId, photoDataUrl)
        const dbEntry = await db.insertPhotoQueue(kidId, photoPath)
        // Update the local entry's ID to match Supabase
        setPhotoQueueState(prev => prev.map(p => p.id === entry.id ? { ...p, id: dbEntry.id, photoPath } : p))
        await db.updateKid(kidId, { lastPhotoSubmissionDate: t })
      } catch (err) {
        console.error('submitPhoto Supabase error:', err)
        // Keep local entry even if upload fails
      }
    }
    return true
  }, [settings.lastPhotoSubmissionDate, kidId])

  const approvePhoto = useCallback((photoId) => {
    const ownedIds = characters.map(c => c.id)
    const pulledId = attemptPull(ownedIds, kid?.totalXpEarned ?? 0)
    setPhotoQueueState(prev => prev.map(p =>
      p.id === photoId ? { ...p, status: 'approved', pullResult: pulledId } : p
    ))
    const photo = photoQueue.find(p => p.id === photoId)
    if (photo) {
      db.updatePhotoQueue(photoId, { status: 'approved', pullResult: pulledId ?? null }).catch(console.error)
      if (photo.photoPath) db.deletePhotoFromStorage(photo.photoPath).catch(console.error)
    }
    return pulledId
  }, [characters, kid, photoQueue])

  const claimPhotoReward = useCallback((photoId) => {
    const photo = photoQueue.find(p => p.id === photoId)
    if (!photo || photo.status !== 'approved' || photo.claimed) return
    if (photo.pullResult) {
      const newChar = makeCharacterEntry(photo.pullResult)
      setCharactersState(prev => [...prev, newChar])
      if (kidId) db.upsertKidCharacter(kidId, newChar).catch(console.error)
    } else {
      const newCoins = (kid?.coins ?? 0) + BALANCE.cleanRoomCoins
      setKidState(prev => ({ ...prev, coins: newCoins }))
      if (kidId) db.updateKid(kidId, { coins: newCoins }).catch(console.error)
    }
    setPhotoQueueState(prev => prev.map(p =>
      p.id === photoId ? { ...p, claimed: true, photoDataUrl: null } : p
    ))
    db.updatePhotoQueue(photoId, { claimed: true }).catch(console.error)
  }, [photoQueue, kid, kidId])

  const rejectPhoto = useCallback((photoId) => {
    const photo = photoQueue.find(p => p.id === photoId)
    setPhotoQueueState(prev => prev.map(p =>
      p.id === photoId ? { ...p, status: 'rejected', photoDataUrl: null } : p
    ))
    if (photo) {
      db.updatePhotoQueue(photoId, { status: 'rejected', photoPath: null }).catch(console.error)
      if (photo.photoPath) db.deletePhotoFromStorage(photo.photoPath).catch(console.error)
    }
  }, [photoQueue])

  // ─── Character Management ─────────────────────────────────────────────────────

  const setActiveCharacter = useCallback((id) => {
    if (characters.find(c => c.id === id)) {
      setActiveCharacterIdState(id)
      if (kidId) db.updateKid(kidId, { activeCharacterId: id }).catch(console.error)
    }
  }, [characters, kidId])

  const renameCharacter = useCallback((id, nickname) => {
    setCharactersState(prev => prev.map(c => c.id === id ? { ...c, nickname } : c))
    if (kidId) {
      const char = characters.find(c => c.id === id)
      if (char) db.upsertKidCharacter(kidId, { ...char, nickname }).catch(console.error)
    }
  }, [characters, kidId])

  const updateSettings = useCallback((updates) => {
    setSettingsState(prev => ({ ...prev, ...updates }))
    // Sync PIN / sound to Supabase via auth
    if (updates.parentPin !== undefined || updates.soundOn !== undefined) {
      const syncUpdates = {}
      if (updates.parentPin !== undefined) syncUpdates.pin = updates.parentPin
      if (updates.soundOn !== undefined) syncUpdates.soundOn = updates.soundOn
      updateParentSettings(syncUpdates).catch(console.error)
    }
    if (updates.lastPhotoSubmissionDate !== undefined && kidId) {
      db.updateKid(kidId, { lastPhotoSubmissionDate: updates.lastPhotoSubmissionDate }).catch(console.error)
    }
  }, [updateParentSettings, kidId])

  // ─── Custom Rewards ───────────────────────────────────────────────────────────

  const addCustomReward = useCallback((reward) => {
    const newReward = { ...reward, id: nanoid(), createdAt: new Date().toISOString() }
    setCustomRewardsState(prev => [...prev, newReward])
    if (parentId) {
      db.insertCustomReward(parentId, reward).then(dbReward => {
        setCustomRewardsState(prev => prev.map(r => r.id === newReward.id ? dbReward : r))
      }).catch(console.error)
    }
  }, [parentId])

  const deleteCustomReward = useCallback((id) => {
    setCustomRewardsState(prev => prev.filter(r => r.id !== id))
    db.deleteCustomRewardDb(id).catch(console.error)
  }, [])

  const redeemCustomReward = useCallback((rewardId) => {
    const reward = customRewards.find(r => r.id === rewardId)
    if (!reward || !kid || kid.coins < reward.coinCost) return false

    const newCoins = kid.coins - reward.coinCost
    const redemption = {
      id: nanoid(),
      rewardId,
      rewardName: reward.name,
      rewardEmoji: reward.emoji,
      rewardDescription: reward.description,
      coinCost: reward.coinCost,
      purchasedAt: new Date().toISOString(),
      status: 'pending',
    }
    setKidState(prev => ({ ...prev, coins: newCoins }))
    setRewardRedemptionsState(prev => [...prev, redemption])

    if (kidId) {
      Promise.all([
        db.updateKid(kidId, { coins: newCoins }),
        db.insertRewardRedemption(kidId, redemption),
      ]).catch(console.error)
    }
    return true
  }, [customRewards, kid, kidId])

  const fulfillRedemption = useCallback((redemptionId) => {
    setRewardRedemptionsState(prev => prev.map(r => r.id === redemptionId ? { ...r, status: 'fulfilled' } : r))
    db.updateRewardRedemption(redemptionId, { status: 'fulfilled' }).catch(console.error)
  }, [])

  const rejectRedemption = useCallback((redemptionId) => {
    const redemption = rewardRedemptions.find(r => r.id === redemptionId)
    if (!redemption) return
    const newCoins = (kid?.coins ?? 0) + redemption.coinCost
    setKidState(prev => ({ ...prev, coins: newCoins }))
    setRewardRedemptionsState(prev => prev.map(r => r.id === redemptionId ? { ...r, status: 'rejected' } : r))

    const targetKidId = redemption.kidId ?? kidId
    if (targetKidId) {
      Promise.all([
        db.updateRewardRedemption(redemptionId, { status: 'rejected' }),
        db.updateKid(targetKidId, { coins: newCoins }),
      ]).catch(console.error)
    }
  }, [rewardRedemptions, kid, kidId])

  // ─── Computed ─────────────────────────────────────────────────────────────────

  const pendingPhotoCount = photoQueue.filter(p => p.status === 'pending').length
  const pendingChoreCount = pendingCompletions.filter(p => p.status === 'pending').length
  const unclaimedPhoto = photoQueue.find(p => p.status === 'approved' && !p.claimed) ?? null
  const latestApproval = recentApprovals[recentApprovals.length - 1] ?? null
  const pendingRedemptionCount = rewardRedemptions.filter(r => r.status === 'pending').length

  return (
    <AppContext.Provider value={{
      kid, characters, activeCharacterId, activeCharacter,
      chores, completions, pendingCompletions, recentApprovals, latestApproval,
      streaks, photoQueue, settings: mergedSettings, purchaseHistory,
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
