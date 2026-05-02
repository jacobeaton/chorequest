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

export const AppProvider = ({ children }) => {
  const [kid, setKidState] = useState(() => storage.getKid())
  const [characters, setCharactersState] = useState(() => applyHappinessDecay(storage.getCharacters()))
  const [activeCharacterId, setActiveCharacterIdState] = useState(() => storage.getActiveCharacter())
  const [chores, setChoresState] = useState(() => {
    const stored = storage.getChores()
    return stored.length ? stored : SEED_CHORES
  })
  const [completions, setCompletionsState] = useState(() => storage.getCompletions())
  const [streaks, setStreaksState] = useState(() => storage.getStreaks())
  const [photoQueue, setPhotoQueueState] = useState(() => storage.getPhotoQueue())
  const [settings, setSettingsState] = useState(() => storage.getSettings())
  const [purchaseHistory, setPurchaseHistoryState] = useState(() => storage.getPurchaseHistory())

  // Persist on change
  useEffect(() => { storage.setKid(kid) }, [kid])
  useEffect(() => { storage.setCharacters(characters) }, [characters])
  useEffect(() => { storage.setActiveCharacter(activeCharacterId) }, [activeCharacterId])
  useEffect(() => { storage.setChores(chores) }, [chores])
  useEffect(() => { storage.setCompletions(completions) }, [completions])
  useEffect(() => { storage.setStreaks(streaks) }, [streaks])
  useEffect(() => { storage.setPhotoQueue(photoQueue) }, [photoQueue])
  useEffect(() => { storage.setSettings(settings) }, [settings])
  useEffect(() => { storage.setPurchaseHistory(purchaseHistory) }, [purchaseHistory])

  const activeCharacter = characters.find(c => c.id === activeCharacterId) ?? null

  // ─── Setup ────────────────────────────────────────────────────────────────

  const setupKid = useCallback((name, starterId) => {
    const newKid = { name, totalXpEarned: 0, coins: 0, accountLevel: 0 }
    const startChar = makeCharacterEntry(starterId)
    setKidState(newKid)
    setCharactersState([startChar])
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

  // ─── Complete Chore ───────────────────────────────────────────────────────

  const completeChore = useCallback((choreId, timeTaken) => {
    const chore = chores.find(c => c.id === choreId)
    if (!chore || !activeCharacterId) return null

    const today = new Date().toISOString().split('T')[0]
    const beatTimer = timeTaken <= chore.estimatedMinutes * 60

    const streakActive = (() => {
      const last = streaks.lastCompletionDate
      if (!last) return false
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yStr = yesterday.toISOString().split('T')[0]
      return streaks.currentStreak >= BALANCE.streakThresholdDays - 1 && last === yStr
    })()

    const char = characters.find(c => c.id === activeCharacterId)
    const xp = calcXpEarned(chore.difficulty, beatTimer, streakActive, char?.happiness ?? 80)
    const coins = calcCoinsEarned(chore.difficulty, beatTimer, streakActive)

    // Update character
    const updated = applyXpToCharacter(char, xp)
    const evolved = updated.evolved
    delete updated.evolved
    updated.happiness = Math.min(BALANCE.happiness.max, (updated.happiness ?? 80) + 5)
    updated.lastInteractionDate = today

    setCharactersState(prev => prev.map(c => c.id === activeCharacterId ? updated : c))

    // Update kid
    setKidState(prev => {
      const totalXpEarned = prev.totalXpEarned + xp
      return {
        ...prev,
        coins: prev.coins + coins,
        totalXpEarned,
        accountLevel: getAccountLevel(totalXpEarned),
      }
    })

    // Update streaks
    setStreaksState(prev => {
      const last = prev.lastCompletionDate
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yStr = yesterday.toISOString().split('T')[0]
      const newStreak = last === today
        ? prev.currentStreak
        : last === yStr
          ? prev.currentStreak + 1
          : 1
      return { currentStreak: newStreak, lastCompletionDate: today }
    })

    // Record completion
    const entry = { id: nanoid(), choreId, characterId: activeCharacterId, timestamp: new Date().toISOString(), timeTaken, pointsEarned: xp, coinsEarned: coins, bonusApplied: beatTimer }
    setCompletionsState(prev => [...prev, entry])

    return { xp, coins, beatTimer, evolved, streakActive, newLevel: updated.level, evolutionStage: updated.evolutionStage }
  }, [chores, activeCharacterId, characters, streaks])

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
    const today = new Date().toISOString().split('T')[0]
    if (settings.lastPhotoSubmissionDate === today) return false

    const entry = { id: nanoid(), photoDataUrl, submittedAt: new Date().toISOString(), status: 'pending', pullResult: null }
    setPhotoQueueState(prev => [...prev, entry])
    setSettingsState(prev => ({ ...prev, lastPhotoSubmissionDate: today }))
    return true
  }, [settings.lastPhotoSubmissionDate])

  const approvePhoto = useCallback((photoId) => {
    const ownedIds = characters.map(c => c.id)
    const pulledId = attemptPull(ownedIds, kid?.totalXpEarned ?? 0)

    setPhotoQueueState(prev => prev.map(p =>
      p.id === photoId ? { ...p, status: 'approved', pullResult: pulledId } : p
    ))

    if (pulledId) {
      setCharactersState(prev => [...prev, makeCharacterEntry(pulledId)])
    }

    return pulledId
  }, [characters, kid])

  const rejectPhoto = useCallback((photoId) => {
    setPhotoQueueState(prev => prev.map(p =>
      p.id === photoId ? { ...p, status: 'rejected' } : p
    ))
  }, [])

  // ─── Character Management ─────────────────────────────────────────────────

  const setActiveCharacter = useCallback((id) => {
    if (characters.find(c => c.id === id)) setActiveCharacterIdState(id)
  }, [characters])

  const renameCharacter = useCallback((id, nickname) => {
    setCharactersState(prev => prev.map(c => c.id === id ? { ...c, nickname } : c))
  }, [])

  // ─── Settings ─────────────────────────────────────────────────────────────

  const updateSettings = useCallback((updates) => {
    setSettingsState(prev => ({ ...prev, ...updates }))
  }, [])

  const pendingPhotoCount = photoQueue.filter(p => p.status === 'pending').length

  return (
    <AppContext.Provider value={{
      kid, characters, activeCharacterId, activeCharacter,
      chores, completions, streaks, photoQueue, settings, purchaseHistory,
      pendingPhotoCount,
      setupKid, addChore, updateChore, deleteChore,
      completeChore, buyItem,
      submitPhoto, approvePhoto, rejectPhoto,
      setActiveCharacter, renameCharacter, updateSettings,
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
