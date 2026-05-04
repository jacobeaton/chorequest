import { supabase } from './supabase'

// ─── Auth ──────────────────────────────────────────────────────────────────────

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })

export const signInWithEmail = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signUpWithEmail = (email, password) =>
  supabase.auth.signUp({ email, password })

export const signOut = () => supabase.auth.signOut()

// ─── Parent Settings ───────────────────────────────────────────────────────────

export const getParentSettings = async (parentId) => {
  const { data } = await supabase.from('parent_settings').select('*').eq('parent_id', parentId).single()
  return data ? { pin: data.pin, soundOn: data.sound_on } : null
}

export const upsertParentSettings = async (parentId, updates) => {
  const row = { parent_id: parentId }
  if (updates.pin !== undefined) row.pin = updates.pin
  if (updates.soundOn !== undefined) row.sound_on = updates.soundOn
  await supabase.from('parent_settings').upsert(row, { onConflict: 'parent_id' })
}

// ─── Kids ──────────────────────────────────────────────────────────────────────

export const getKids = async () => {
  const { data } = await supabase.from('kids').select('*').order('created_at')
  return (data ?? []).map(rowToKid)
}

export const getKidById = async (kidId) => {
  const { data } = await supabase.from('kids').select('*').eq('id', kidId).single()
  return data ? rowToKid(data) : null
}

export const createKid = async (parentId, name) => {
  const { data, error } = await supabase.from('kids').insert({
    parent_id: parentId,
    name,
    total_xp_earned: 0,
    coins: 0,
    account_level: 0,
    current_streak: 0,
  }).select().single()
  if (error) throw error
  return rowToKid(data)
}

export const updateKid = async (kidId, updates) => {
  const row = {}
  if (updates.totalXpEarned !== undefined) row.total_xp_earned = updates.totalXpEarned
  if (updates.coins !== undefined) row.coins = updates.coins
  if (updates.accountLevel !== undefined) row.account_level = updates.accountLevel
  if (updates.activeCharacterId !== undefined) row.active_character_id = updates.activeCharacterId
  if (updates.currentStreak !== undefined) row.current_streak = updates.currentStreak
  if (updates.lastCompletionDate !== undefined) row.last_completion_date = updates.lastCompletionDate
  if (updates.lastPhotoSubmissionDate !== undefined) row.last_photo_submission_date = updates.lastPhotoSubmissionDate
  if (updates.guaranteedLuminPull !== undefined) row.guaranteed_lumin_pull = updates.guaranteedLuminPull
  await supabase.from('kids').update(row).eq('id', kidId)
}

const rowToKid = (row) => ({
  id: row.id,
  parentId: row.parent_id,
  name: row.name,
  totalXpEarned: row.total_xp_earned,
  coins: row.coins,
  accountLevel: row.account_level,
  activeCharacterId: row.active_character_id,
  currentStreak: row.current_streak,
  lastCompletionDate: row.last_completion_date,
  lastPhotoSubmissionDate: row.last_photo_submission_date,
  guaranteedLuminPull: row.guaranteed_lumin_pull ?? false,
})

// ─── Kid Characters ────────────────────────────────────────────────────────────

export const getKidCharacters = async (kidId) => {
  const { data } = await supabase.from('kid_characters').select('*').eq('kid_id', kidId)
  return (data ?? []).map(rowToCharacter)
}

export const upsertKidCharacter = async (kidId, char) => {
  await supabase.from('kid_characters').upsert({
    kid_id: kidId,
    character_id: char.id,
    level: char.level,
    xp: char.xp,
    evolution_stage: char.evolutionStage,
    happiness: char.happiness,
    last_interaction_date: char.lastInteractionDate,
    nickname: char.nickname ?? null,
  }, { onConflict: 'kid_id,character_id' })
}

const rowToCharacter = (row) => ({
  id: row.character_id,
  level: row.level,
  xp: row.xp,
  evolutionStage: row.evolution_stage,
  happiness: row.happiness,
  lastInteractionDate: row.last_interaction_date,
  nickname: row.nickname,
})

// ─── Chores ────────────────────────────────────────────────────────────────────

export const getChores = async () => {
  const { data } = await supabase.from('chores').select('*').order('created_at')
  return (data ?? []).map(rowToChore)
}

export const insertChore = async (parentId, chore) => {
  const { data, error } = await supabase.from('chores').insert({
    parent_id: parentId,
    assigned_kid_id: chore.assignedKidId ?? null,
    name: chore.name,
    emoji: chore.emoji,
    estimated_minutes: chore.estimatedMinutes,
    points: chore.points ?? 0,
    coins: chore.coins ?? 0,
    difficulty: chore.difficulty,
    created_by: chore.createdBy,
    frequency: chore.frequency ?? 'daily',
  }).select().single()
  if (error) throw error
  return rowToChore(data)
}

export const updateChoreDb = async (choreId, updates) => {
  const row = {}
  if (updates.name !== undefined) row.name = updates.name
  if (updates.emoji !== undefined) row.emoji = updates.emoji
  if (updates.estimatedMinutes !== undefined) row.estimated_minutes = updates.estimatedMinutes
  if (updates.difficulty !== undefined) row.difficulty = updates.difficulty
  if (updates.assignedKidId !== undefined) row.assigned_kid_id = updates.assignedKidId
  if (updates.frequency !== undefined) row.frequency = updates.frequency
  await supabase.from('chores').update(row).eq('id', choreId)
}

export const deleteChoreDb = async (choreId) => {
  await supabase.from('chores').delete().eq('id', choreId)
}

export const seedDefaultChores = async (parentId) => {
  const rows = [
    { parent_id: parentId, name: 'Make Bed', emoji: '🛏️', estimated_minutes: 5, points: 10, coins: 5, difficulty: 'easy', created_by: 'parent' },
    { parent_id: parentId, name: 'Tidy Room', emoji: '🧹', estimated_minutes: 15, points: 25, coins: 12, difficulty: 'medium', created_by: 'parent' },
    { parent_id: parentId, name: 'Empty Dishwasher', emoji: '🍽️', estimated_minutes: 10, points: 25, coins: 12, difficulty: 'medium', created_by: 'parent' },
    { parent_id: parentId, name: 'Vacuum Living Room', emoji: '🌀', estimated_minutes: 20, points: 50, coins: 25, difficulty: 'hard', created_by: 'parent' },
    { parent_id: parentId, name: 'Take Out Trash', emoji: '🗑️', estimated_minutes: 5, points: 10, coins: 5, difficulty: 'easy', created_by: 'parent' },
    { parent_id: parentId, name: 'Clean Bathroom Sink', emoji: '🚿', estimated_minutes: 8, points: 10, coins: 5, difficulty: 'easy', created_by: 'parent' },
  ]
  await supabase.from('chores').insert(rows)
}

const rowToChore = (row) => ({
  id: row.id,
  parentId: row.parent_id,
  assignedKidId: row.assigned_kid_id,
  name: row.name,
  emoji: row.emoji,
  estimatedMinutes: row.estimated_minutes,
  points: row.points,
  coins: row.coins,
  difficulty: row.difficulty,
  createdBy: row.created_by,
  frequency: row.frequency ?? 'daily',
})

// ─── Pending Completions ───────────────────────────────────────────────────────

export const getPendingCompletions = async (kidId) => {
  const { data } = await supabase
    .from('pending_completions')
    .select('*')
    .eq('kid_id', kidId)
    .order('submitted_at', { ascending: false })
  return (data ?? []).map(rowToPending)
}

export const getAllPendingCompletions = async () => {
  const { data } = await supabase
    .from('pending_completions')
    .select('*, kids(name)')
    .order('submitted_at', { ascending: false })
  return (data ?? []).map(row => ({ ...rowToPending(row), kidName: row.kids?.name }))
}

export const insertPendingCompletion = async (kidId, entry) => {
  const { data, error } = await supabase.from('pending_completions').insert({
    id: entry.id,
    kid_id: kidId,
    chore_id: entry.choreId ?? null,
    chore_name: entry.choreName,
    chore_emoji: entry.choreEmoji,
    character_id: entry.characterId,
    time_taken: entry.timeTaken,
    beat_timer: entry.beatTimer,
    streak_active: entry.streakActive,
    xp: entry.xp,
    coins: entry.coins,
    status: 'pending',
  }).select().single()
  if (error) throw error
  return rowToPending(data)
}

export const updatePendingCompletion = async (id, updates) => {
  const row = {}
  if (updates.status !== undefined) row.status = updates.status
  await supabase.from('pending_completions').update(row).eq('id', id)
}

const rowToPending = (row) => ({
  id: row.id,
  kidId: row.kid_id,
  choreId: row.chore_id,
  choreName: row.chore_name,
  choreEmoji: row.chore_emoji,
  characterId: row.character_id,
  timeTaken: row.time_taken,
  beatTimer: row.beat_timer,
  streakActive: row.streak_active,
  xp: row.xp,
  coins: row.coins,
  submittedAt: row.submitted_at,
  status: row.status,
})

// ─── Completions ───────────────────────────────────────────────────────────────

export const insertCompletion = async (kidId, entry) => {
  await supabase.from('completions').insert({
    kid_id: kidId,
    chore_id: entry.choreId ?? null,
    character_id: entry.characterId,
    time_taken: entry.timeTaken,
    points_earned: entry.pointsEarned,
    coins_earned: entry.coinsEarned,
    bonus_applied: entry.bonusApplied,
  })
}

// ─── Photo Queue ───────────────────────────────────────────────────────────────

export const getPhotoQueue = async (kidId) => {
  const { data } = await supabase
    .from('photo_queue')
    .select('*')
    .eq('kid_id', kidId)
    .order('submitted_at', { ascending: false })
  return (data ?? []).map(rowToPhoto)
}

export const getAllPendingPhotos = async () => {
  const { data } = await supabase
    .from('photo_queue')
    .select('*, kids(name)')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: false })
  return (data ?? []).map(row => ({ ...rowToPhoto(row), kidName: row.kids?.name }))
}

export const uploadPhoto = async (kidId, photoDataUrl) => {
  const filename = `${kidId}/${Date.now()}.jpg`
  const blob = dataUrlToBlob(photoDataUrl)
  const { error: uploadError } = await supabase.storage
    .from('room-photos')
    .upload(filename, blob, { contentType: 'image/jpeg' })
  if (uploadError) throw uploadError
  return filename
}

export const getPhotoUrl = async (path) => {
  if (!path) return null
  const { data } = await supabase.storage.from('room-photos').createSignedUrl(path, 3600)
  return data?.signedUrl ?? null
}

export const insertPhotoQueue = async (kidId, photoPath) => {
  const { data, error } = await supabase.from('photo_queue').insert({
    kid_id: kidId,
    photo_path: photoPath,
    status: 'pending',
  }).select().single()
  if (error) throw error
  return rowToPhoto(data)
}

export const updatePhotoQueue = async (id, updates) => {
  const row = {}
  if (updates.status !== undefined) row.status = updates.status
  if (updates.pullResult !== undefined) row.pull_result = updates.pullResult
  if (updates.claimed !== undefined) row.claimed = updates.claimed
  if ('photoPath' in updates) row.photo_path = updates.photoPath
  await supabase.from('photo_queue').update(row).eq('id', id)
}

export const deletePhotoFromStorage = async (path) => {
  if (path) await supabase.storage.from('room-photos').remove([path])
}

const rowToPhoto = (row) => ({
  id: row.id,
  kidId: row.kid_id,
  photoPath: row.photo_path,
  submittedAt: row.submitted_at,
  status: row.status,
  pullResult: row.pull_result,
  claimed: row.claimed,
})

const dataUrlToBlob = (dataUrl) => {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)[1]
  const binary = atob(data)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i)
  return new Blob([array], { type: mime })
}

// ─── Custom Rewards ────────────────────────────────────────────────────────────

export const getCustomRewards = async () => {
  const { data } = await supabase.from('custom_rewards').select('*').order('created_at')
  return (data ?? []).map(rowToReward)
}

export const insertCustomReward = async (parentId, reward) => {
  const { data, error } = await supabase.from('custom_rewards').insert({
    parent_id: parentId,
    name: reward.name,
    emoji: reward.emoji,
    description: reward.description ?? '',
    coin_cost: reward.coinCost,
  }).select().single()
  if (error) throw error
  return rowToReward(data)
}

export const deleteCustomRewardDb = async (id) => {
  await supabase.from('custom_rewards').delete().eq('id', id)
}

const rowToReward = (row) => ({
  id: row.id,
  parentId: row.parent_id,
  name: row.name,
  emoji: row.emoji,
  description: row.description,
  coinCost: row.coin_cost,
})

// ─── Reward Redemptions ────────────────────────────────────────────────────────

export const getRewardRedemptions = async (kidId) => {
  const { data } = await supabase
    .from('reward_redemptions')
    .select('*')
    .eq('kid_id', kidId)
    .order('purchased_at', { ascending: false })
  return (data ?? []).map(rowToRedemption)
}

export const getAllRewardRedemptions = async () => {
  const { data } = await supabase
    .from('reward_redemptions')
    .select('*, kids(name)')
    .order('purchased_at', { ascending: false })
  return (data ?? []).map(row => ({ ...rowToRedemption(row), kidName: row.kids?.name }))
}

export const insertRewardRedemption = async (kidId, redemption) => {
  const { data, error } = await supabase.from('reward_redemptions').insert({
    kid_id: kidId,
    reward_id: redemption.rewardId ?? null,
    reward_name: redemption.rewardName,
    reward_emoji: redemption.rewardEmoji,
    reward_description: redemption.rewardDescription ?? '',
    coin_cost: redemption.coinCost,
    status: 'pending',
  }).select().single()
  if (error) throw error
  return rowToRedemption(data)
}

export const updateRewardRedemption = async (id, updates) => {
  const row = {}
  if (updates.status !== undefined) row.status = updates.status
  await supabase.from('reward_redemptions').update(row).eq('id', id)
}

const rowToRedemption = (row) => ({
  id: row.id,
  kidId: row.kid_id,
  rewardId: row.reward_id,
  rewardName: row.reward_name,
  rewardEmoji: row.reward_emoji,
  rewardDescription: row.reward_description,
  coinCost: row.coin_cost,
  purchasedAt: row.purchased_at,
  status: row.status,
})

// ─── Kid Notifications ─────────────────────────────────────────────────────────

export const getKidNotifications = async (kidId) => {
  const { data } = await supabase
    .from('kid_notifications')
    .select('*')
    .eq('kid_id', kidId)
    .eq('dismissed', false)
    .order('created_at', { ascending: false })
  return (data ?? []).map(rowToNotification)
}

export const insertKidNotification = async (kidId, type, payload) => {
  await supabase.from('kid_notifications').insert({ kid_id: kidId, type, payload })
}

export const dismissKidNotification = async (id) => {
  await supabase.from('kid_notifications').update({ dismissed: true }).eq('id', id)
}

const rowToNotification = (row) => ({
  id: row.id,
  kidId: row.kid_id,
  type: row.type,
  payload: row.payload,
  dismissed: row.dismissed,
  createdAt: row.created_at,
})

// ─── Realtime ──────────────────────────────────────────────────────────────────

export const subscribeToKidNotifications = (kidId, onNew) => {
  const channel = supabase
    .channel(`kid_notifs_${kidId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'kid_notifications',
      filter: `kid_id=eq.${kidId}`,
    }, (payload) => onNew(rowToNotification(payload.new)))
    .subscribe()
  return () => supabase.removeChannel(channel)
}

export const subscribeToPendingCompletions = (onNew) => {
  const channel = supabase
    .channel('pending_completions_new')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'pending_completions',
    }, (payload) => onNew(rowToPending(payload.new)))
    .subscribe()
  return () => supabase.removeChannel(channel)
}

export const subscribeToPendingPhotos = (onNew) => {
  const channel = supabase
    .channel('photo_queue_new')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'photo_queue',
    }, (payload) => onNew(rowToPhoto(payload.new)))
    .subscribe()
  return () => supabase.removeChannel(channel)
}
