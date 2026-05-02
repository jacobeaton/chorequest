const KEYS = {
  KID: 'cq_kid',
  CHARACTERS: 'cq_characters',
  ACTIVE_CHARACTER: 'cq_activeCharacter',
  CHORES: 'cq_chores',
  COMPLETIONS: 'cq_completions',
  STREAKS: 'cq_streaks',
  PHOTO_QUEUE: 'cq_photoQueue',
  SETTINGS: 'cq_settings',
  PURCHASE_HISTORY: 'cq_purchaseHistory',
}

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('localStorage write failed', e)
  }
}

export const storage = {
  getKid: () => read(KEYS.KID, null),
  setKid: (v) => write(KEYS.KID, v),

  getCharacters: () => read(KEYS.CHARACTERS, []),
  setCharacters: (v) => write(KEYS.CHARACTERS, v),

  getActiveCharacter: () => read(KEYS.ACTIVE_CHARACTER, null),
  setActiveCharacter: (v) => write(KEYS.ACTIVE_CHARACTER, v),

  getChores: () => read(KEYS.CHORES, []),
  setChores: (v) => write(KEYS.CHORES, v),

  getCompletions: () => read(KEYS.COMPLETIONS, []),
  setCompletions: (v) => write(KEYS.COMPLETIONS, v),

  getStreaks: () => read(KEYS.STREAKS, { currentStreak: 0, lastCompletionDate: null }),
  setStreaks: (v) => write(KEYS.STREAKS, v),

  getPhotoQueue: () => read(KEYS.PHOTO_QUEUE, []),
  setPhotoQueue: (v) => write(KEYS.PHOTO_QUEUE, v),

  getSettings: () => read(KEYS.SETTINGS, { parentPin: '1234', soundOn: true, isFirstRun: true, lastPhotoSubmissionDate: null }),
  setSettings: (v) => write(KEYS.SETTINGS, v),

  getPurchaseHistory: () => read(KEYS.PURCHASE_HISTORY, []),
  setPurchaseHistory: (v) => write(KEYS.PURCHASE_HISTORY, v),

  clearAll: () => Object.values(KEYS).forEach(k => localStorage.removeItem(k)),
}
