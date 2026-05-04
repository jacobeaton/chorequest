import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { CHARACTERS, STARTERS } from '../../config/characters'
import { attemptPull } from '../../utils/pullSystem'
import { applyXpToCharacter, calcXpEarned, calcCoinsEarned, getAccountLevel } from '../../utils/xpCalc'
import { BALANCE } from '../../config/balance'
import * as db from '../../lib/db'
import LuminSVG from '../lumins/LuminSVG'
import { ArrowLeft, LogOut, Trash2, CheckCircle, XCircle, Hourglass, Edit2, Monitor, Lock, UserPlus } from 'lucide-react'
import { localToday, localDateOf } from '../../utils/dateUtils'

const REWARD_EMOJIS = ['🎮','🍕','🎬','🏖️','🛍️','🎢','💰','🎁','⭐','🚀','🏆','🎪','🎯','🎲','📱','🍦','🎠','🎡','🛒','💵']
const today = localToday

export default function ParentDashboard({ onNavigate }) {
  const { signOut, clearDeviceLock, setDeviceLock, kids, parentSettings, updateParentSettings, createKid, session, refreshKids } = useAuth()
  const [tab, setTab] = useState('queue')
  const [pendingCompletions, setPendingCompletions] = useState([])
  const [pendingPhotos, setPendingPhotos] = useState([])
  const [chores, setChores] = useState([])
  const [customRewards, setCustomRewards] = useState([])
  const [rewardRedemptions, setRewardRedemptions] = useState([])
  const [revealedPull, setRevealedPull] = useState({})
  const [newReward, setNewReward] = useState({ name: '', emoji: '🎁', description: '', coinCost: 100, assignedKidId: null })
  const [addingReward, setAddingReward] = useState(false)
  const [changingPin, setChangingPin] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [loading, setLoading] = useState(true)
  const [addingKid, setAddingKid] = useState(false)
  const [newKidName, setNewKidName] = useState('')
  const [newKidStarter, setNewKidStarter] = useState(null)
  const [addKidLoading, setAddKidLoading] = useState(false)

  const loadData = useCallback(async () => {
    const [pending, photos, choresData, rewards, redemptions] = await Promise.all([
      db.getAllPendingCompletions(),
      db.getAllPendingPhotos(),
      db.getChores(),
      db.getCustomRewards(),
      db.getAllRewardRedemptions(),
    ])
    // Load signed URLs for photos
    const photosWithUrls = await Promise.all(photos.map(async p => ({
      ...p,
      photoDataUrl: p.photoPath ? await db.getPhotoUrl(p.photoPath).catch(() => null) : null,
    })))
    setPendingCompletions(pending.filter(p => p.status === 'pending'))
    setPendingPhotos(photosWithUrls)
    setChores(choresData)
    setCustomRewards(rewards)
    setRewardRedemptions(redemptions)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Realtime: new pending completions
  useEffect(() => {
    const unsub = db.subscribeToPendingCompletions((entry) => {
      setPendingCompletions(prev => [entry, ...prev])
    })
    return unsub
  }, [])

  // Realtime: new pending photos
  useEffect(() => {
    const unsub = db.subscribeToPendingPhotos(async (photo) => {
      const photoDataUrl = photo.photoPath ? await db.getPhotoUrl(photo.photoPath).catch(() => null) : null
      setPendingPhotos(prev => [{ ...photo, photoDataUrl }, ...prev])
    })
    return unsub
  }, [])

  const handleApproveCompletion = async (p) => {
    // Fetch the target kid's current data
    const [kidRow, chars] = await Promise.all([
      db.getKidById(p.kidId),
      db.getKidCharacters(p.kidId),
    ])
    if (!kidRow) return

    const targetChar = chars.find(c => c.id === p.characterId)
    if (!targetChar) return

    const t = today()
    const updatedChar = applyXpToCharacter(targetChar, p.xp)
    const evolved = updatedChar.evolved
    delete updatedChar.evolved
    updatedChar.happiness = Math.min(BALANCE.happiness.max, (updatedChar.happiness ?? 80) + 5)
    updatedChar.lastInteractionDate = t

    const newTotalXp = kidRow.totalXpEarned + p.xp
    const newCoins = kidRow.coins + p.coins
    const newAccountLevel = getAccountLevel(newTotalXp)
    const last = kidRow.lastCompletionDate
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = localDateOf(yesterday)
    const newStreak = last === t ? kidRow.currentStreak : last === yStr ? kidRow.currentStreak + 1 : 1

    await Promise.all([
      db.updatePendingCompletion(p.id, { status: 'approved' }),
      db.upsertKidCharacter(p.kidId, updatedChar),
      db.insertCompletion(p.kidId, {
        choreId: p.choreId,
        characterId: p.characterId,
        timeTaken: p.timeTaken,
        pointsEarned: p.xp,
        coinsEarned: p.coins,
        bonusApplied: p.beatTimer,
      }),
      db.updateKid(p.kidId, {
        coins: newCoins,
        totalXpEarned: newTotalXp,
        accountLevel: newAccountLevel,
        currentStreak: newStreak,
        lastCompletionDate: t,
      }),
      db.insertKidNotification(p.kidId, 'chore_approved', {
        completionId: p.id,
        choreName: p.choreName,
        choreEmoji: p.choreEmoji,
        xp: p.xp,
        coins: p.coins,
        beatTimer: p.beatTimer,
        evolved,
        newLevel: updatedChar.level,
        evolutionStage: updatedChar.evolutionStage,
        characterId: p.characterId,
      }),
    ])

    setPendingCompletions(prev => prev.filter(c => c.id !== p.id))
  }

  const handleRejectCompletion = async (id) => {
    const p = pendingCompletions.find(c => c.id === id)
    await db.updatePendingCompletion(id, { status: 'rejected' })
    if (p?.kidId) {
      db.insertKidNotification(p.kidId, 'chore_rejected', {
        completionId: id,
        choreName: p.choreName,
        choreEmoji: p.choreEmoji,
      }).catch(console.error)
    }
    setPendingCompletions(prev => prev.filter(c => c.id !== id))
  }

  const handleApprovePhoto = async (photo) => {
    const kidRow = await db.getKidById(photo.kidId)
    const chars = await db.getKidCharacters(photo.kidId)
    const ownedIds = chars.map(c => c.id)
    const forceWin = kidRow?.guaranteedLuminPull ?? false
    const pulledId = attemptPull(ownedIds, kidRow?.totalXpEarned ?? 0, forceWin)

    await db.updatePhotoQueue(photo.id, { status: 'approved', pullResult: pulledId ?? null })
    setRevealedPull(prev => ({ ...prev, [photo.id]: pulledId }))

    if (forceWin) {
      await db.updateKid(photo.kidId, { guaranteedLuminPull: false })
      refreshKids()
    }
    if (photo.photoPath) db.deletePhotoFromStorage(photo.photoPath).catch(() => {})
  }

  const handleRejectPhoto = async (photo) => {
    await db.updatePhotoQueue(photo.id, { status: 'rejected', photoPath: null })
    setPendingPhotos(prev => prev.filter(p => p.id !== photo.id))
    if (photo.photoPath) db.deletePhotoFromStorage(photo.photoPath).catch(() => {})
  }

  const handleAddChore = () => onNavigate('add', { createdBy: 'parent' })

  const handleDeleteChore = async (choreId) => {
    await db.deleteChoreDb(choreId)
    setChores(prev => prev.filter(c => c.id !== choreId))
  }

  const handleAddReward = async () => {
    if (!newReward.name.trim()) return
    const created = await db.insertCustomReward(session?.user?.id, newReward)
    setCustomRewards(prev => [...prev, created])
    setNewReward({ name: '', emoji: '🎁', description: '', coinCost: 100, assignedKidId: null })
    setAddingReward(false)
  }

  const handleAddKid = async () => {
    if (!newKidName.trim() || !newKidStarter) return
    setAddKidLoading(true)
    try {
      await createKid(newKidName.trim(), newKidStarter)
      setNewKidName('')
      setNewKidStarter(null)
      setAddingKid(false)
    } catch (err) {
      console.error('addKid error:', err)
    } finally {
      setAddKidLoading(false)
    }
  }

  const handleDeleteReward = async (id) => {
    await db.deleteCustomRewardDb(id)
    setCustomRewards(prev => prev.filter(r => r.id !== id))
  }

  const handleFulfill = async (id) => {
    await db.updateRewardRedemption(id, { status: 'fulfilled' })
    setRewardRedemptions(prev => prev.map(r => r.id === id ? { ...r, status: 'fulfilled' } : r))
  }

  const handleRefundRedemption = async (r) => {
    const kidRow = await db.getKidById(r.kidId)
    if (!kidRow) return
    await Promise.all([
      db.updateRewardRedemption(r.id, { status: 'rejected' }),
      db.updateKid(r.kidId, { coins: kidRow.coins + r.coinCost }),
    ])
    setRewardRedemptions(prev => prev.map(x => x.id === r.id ? { ...x, status: 'rejected' } : x))
  }

  const pendingRedemptions = rewardRedemptions.filter(r => r.status === 'pending')
  const totalPending = pendingCompletions.length + pendingPhotos.length + pendingRedemptions.length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 font-bold">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-4 pt-10 pb-4 rounded-b-[2rem] shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <h1 className="text-white font-black text-2xl">Parent Dashboard</h1>
            <p className="text-gray-400 text-xs">{kids.map(k => k.name).join(', ')}</p>
          </div>
          <button onClick={clearDeviceLock} className="bg-white/10 rounded-full p-2" title="Switch device">
            <Monitor size={18} className="text-gray-300" />
          </button>
          <button onClick={signOut} className="bg-white/10 rounded-full p-2" title="Sign out">
            <LogOut size={18} className="text-gray-300" />
          </button>
        </div>
        <div className="flex gap-1">
          {['queue', 'chores', 'rewards', 'kids', 'settings'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-colors ${tab === t ? 'bg-white text-gray-700' : 'bg-white/15 text-white'}`}>
              {t === 'queue'
                ? `📋${totalPending ? ` (${totalPending})` : ''}`
                : t === 'chores' ? '📝 Chores'
                : t === 'rewards' ? '🎁 Rewards'
                : t === 'kids' ? '👧 Kids'
                : '⚙️ Settings'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8 px-4 py-4">
        {tab === 'queue' && (
          <div className="space-y-4">
            {pendingCompletions.map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Hourglass size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-800">{p.choreEmoji} {p.choreName}</p>
                    <p className="text-xs text-gray-400">
                      {p.kidName ? `${p.kidName} · ` : ''}{new Date(p.submittedAt).toLocaleString()} ·{' '}
                      {p.beatTimer ? '🏆 ' : ''}{p.timeTaken < 60 ? `${p.timeTaken}s` : `${Math.floor(p.timeTaken/60)}m ${p.timeTaken%60}s`}
                    </p>
                  </div>
                  <div className="text-right text-sm flex-shrink-0">
                    <p className="font-bold text-purple-600">+{p.xp} XP</p>
                    <p className="font-bold text-amber-600">+{p.coins} 🪙</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApproveCompletion(p)}
                    className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white font-bold py-2 rounded-xl active:scale-95 transition-transform text-sm">
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button onClick={() => handleRejectCompletion(p.id)}
                    className="flex-1 flex items-center justify-center gap-1 bg-red-400 text-white font-bold py-2 rounded-xl active:scale-95 transition-transform text-sm">
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}

            {pendingPhotos.map(photo => (
              <div key={photo.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {photo.photoDataUrl
                  ? <img src={photo.photoDataUrl} alt="Room" className="w-full aspect-video object-cover" />
                  : <div className="w-full aspect-video bg-gray-100 flex items-center justify-center text-gray-400 text-sm">No preview available</div>
                }
                <div className="p-4 space-y-3">
                  <p className="text-xs text-gray-400">{photo.kidName ? `${photo.kidName} · ` : ''}{new Date(photo.submittedAt).toLocaleString()}</p>
                  {revealedPull[photo.id] !== undefined ? (
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      {revealedPull[photo.id] ? (
                        <>
                          <p className="font-black text-green-700">✨ New Lumin!</p>
                          <p className="text-green-600 font-bold capitalize">{CHARACTERS[revealedPull[photo.id]]?.evolutionNames[0]}</p>
                        </>
                      ) : (
                        <p className="font-bold text-gray-600">Approved — no new Lumin.</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprovePhoto(photo)}
                        className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white font-bold py-2 rounded-xl active:scale-95 transition-transform text-sm">
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button onClick={() => handleRejectPhoto(photo)}
                        className="flex-1 flex items-center justify-center gap-1 bg-red-400 text-white font-bold py-2 rounded-xl active:scale-95 transition-transform text-sm">
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {pendingRedemptions.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-black text-gray-600 text-xs uppercase tracking-wider">Reward Redemptions</h3>
                {pendingRedemptions.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{r.rewardEmoji}</span>
                      <div className="flex-1">
                        <p className="font-black text-gray-800">{r.rewardName}</p>
                        <p className="text-xs text-gray-400">{r.kidName ? `${r.kidName} · ` : ''}{new Date(r.purchasedAt).toLocaleString()} · 🪙 {r.coinCost}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleFulfill(r.id)} className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white font-bold py-2 rounded-xl text-sm active:scale-95">
                        <CheckCircle size={14} /> Fulfilled
                      </button>
                      <button onClick={() => handleRefundRedemption(r)} className="flex-1 flex items-center justify-center gap-1 bg-red-400 text-white font-bold py-2 rounded-xl text-sm active:scale-95">
                        <XCircle size={14} /> Refund
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPending === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-2">✅</p>
                <p className="font-bold">All clear!</p>
                <p className="text-sm">Nothing to review.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'chores' && (
          <div className="space-y-2">
            <button onClick={handleAddChore}
              className="w-full bg-purple-600 text-white font-black py-3 rounded-2xl mb-4 active:scale-95 transition-transform">
              + Add Chore
            </button>
            {chores.map(chore => (
              <div key={chore.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <span className="text-2xl">{chore.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{chore.name}</p>
                  <p className="text-xs text-gray-400">{chore.difficulty} · {chore.estimatedMinutes}min · ⚡{chore.points} · 🪙{chore.coins}</p>
                </div>
                <button onClick={() => onNavigate('add', { createdBy: 'parent', existingChore: chore })} className="text-purple-400 p-1">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDeleteChore(chore.id)} className="text-red-400 p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'rewards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-gray-700 text-sm uppercase tracking-wide">🎁 Your Rewards</h3>
              <button onClick={() => setAddingReward(a => !a)} className="text-purple-600 font-bold text-sm">
                {addingReward ? 'Cancel' : '+ Add'}
              </button>
            </div>

            {addingReward && (
              <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
                <input
                  type="text" placeholder="Reward name"
                  value={newReward.name} onChange={e => setNewReward(r => ({ ...r, name: e.target.value }))}
                  maxLength={30}
                  className="w-full border-2 border-purple-100 rounded-xl px-3 py-2 font-bold text-gray-800 outline-none focus:border-purple-400 text-sm"
                />
                <input
                  type="text" placeholder="Description"
                  value={newReward.description} onChange={e => setNewReward(r => ({ ...r, description: e.target.value }))}
                  maxLength={50}
                  className="w-full border-2 border-purple-100 rounded-xl px-3 py-2 text-gray-700 outline-none focus:border-purple-400 text-sm"
                />
                <div className="flex gap-2 items-center">
                  <span className="text-sm font-bold text-gray-600">🪙 Cost:</span>
                  <input
                    type="number" min="1" max="9999"
                    value={newReward.coinCost} onChange={e => setNewReward(r => ({ ...r, coinCost: Number(e.target.value) }))}
                    className="w-24 border-2 border-purple-100 rounded-xl px-3 py-2 font-black text-gray-800 outline-none focus:border-purple-400 text-sm"
                  />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-600 block mb-1">For:</span>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setNewReward(r => ({ ...r, assignedKidId: null }))}
                      className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-colors ${newReward.assignedKidId === null ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      All Kids
                    </button>
                    {kids.map(k => (
                      <button
                        key={k.id}
                        onClick={() => setNewReward(r => ({ ...r, assignedKidId: k.id }))}
                        className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-colors ${newReward.assignedKidId === k.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {k.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {REWARD_EMOJIS.map(e => (
                    <button key={e} onClick={() => setNewReward(r => ({ ...r, emoji: e }))}
                      className={`text-xl p-1 rounded-lg ${newReward.emoji === e ? 'bg-purple-100 ring-2 ring-purple-400' : ''}`}>
                      {e}
                    </button>
                  ))}
                </div>
                <button
                  disabled={!newReward.name.trim()}
                  onClick={handleAddReward}
                  className="w-full bg-purple-600 text-white font-black py-2 rounded-xl disabled:opacity-40 active:scale-95">
                  Add Reward
                </button>
              </div>
            )}

            {customRewards.map(r => {
              const assignedKid = r.assignedKidId ? kids.find(k => k.id === r.assignedKidId) : null
              return (
                <div key={r.id} className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3">
                  <span className="text-2xl">{r.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-sm">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.description} · 🪙 {r.coinCost}{assignedKid ? ` · for ${assignedKid.name}` : ''}</p>
                  </div>
                  <button onClick={() => handleDeleteReward(r.id)} className="text-red-400 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'kids' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="font-black text-gray-700">Bonus Lumin Guarantee</h3>
              <p className="text-xs text-gray-400">Give a kid a guaranteed Lumin on their next clean room photo approval. Great for extra motivation!</p>
              {kids.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No kids yet.</p>}
              {kids.map(kid => {
                const active = kid.guaranteedLuminPull
                return (
                  <div key={kid.id} className="flex items-center gap-3 py-2 border-t border-gray-100 first:border-0 first:pt-0">
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-sm">{kid.name}</p>
                      <p className="text-xs text-gray-400">{active ? '✨ Next photo pull guaranteed to win!' : 'Normal pull chance'}</p>
                    </div>
                    <button
                      onClick={async () => {
                        await db.updateKid(kid.id, { guaranteedLuminPull: !active })
                        refreshKids()
                      }}
                      className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                        active ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {active ? '✨ ON' : 'Off'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="font-black text-gray-700">Change PIN</h3>
              <p className="text-xs text-gray-400">Used to access Parent Mode on kid devices.</p>
              {changingPin ? (
                <div className="space-y-2">
                  <input
                    type="password" inputMode="numeric" maxLength={6} value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="New PIN (4–6 digits)"
                    className="w-full border-2 border-purple-200 rounded-xl px-3 py-2 text-lg text-center font-black tracking-widest outline-none focus:border-purple-500"
                  />
                  <div className="flex gap-2">
                    <button
                      disabled={newPin.length < 4}
                      onClick={() => { updateParentSettings({ pin: newPin }); setChangingPin(false); setNewPin('') }}
                      className="flex-1 bg-purple-600 text-white font-bold py-2 rounded-xl disabled:opacity-40">
                      Save PIN
                    </button>
                    <button onClick={() => setChangingPin(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-2 rounded-xl">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setChangingPin(true)} className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                  <Edit2 size={14} /> Change PIN (current: {parentSettings.pin})
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-700">Sound Effects</p>
                <p className="text-xs text-gray-400">Button taps, fanfares, level ups</p>
              </div>
              <button
                onClick={() => updateParentSettings({ soundOn: !parentSettings.soundOn })}
                className={`w-12 h-6 rounded-full transition-colors ${parentSettings.soundOn ? 'bg-purple-500' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${parentSettings.soundOn ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-gray-700">Kids</h3>
                <button onClick={() => setAddingKid(a => !a)} className="flex items-center gap-1 text-purple-600 font-bold text-sm">
                  <UserPlus size={14} /> {addingKid ? 'Cancel' : 'Add Kid'}
                </button>
              </div>

              {addingKid && (
                <div className="space-y-3 pt-1">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Kid's name"
                    value={newKidName}
                    onChange={e => setNewKidName(e.target.value)}
                    maxLength={20}
                    className="w-full border-2 border-purple-100 rounded-xl px-3 py-2 font-bold text-gray-800 outline-none focus:border-purple-400 text-sm"
                  />
                  <p className="text-xs text-gray-500 font-semibold">Choose starter Lumin:</p>
                  <div className="flex gap-2">
                    {STARTERS.map(id => (
                      <button
                        key={id}
                        onClick={() => setNewKidStarter(id)}
                        className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-colors ${newKidStarter === id ? 'border-purple-400 bg-purple-50' : 'border-gray-100 bg-gray-50'}`}
                      >
                        <LuminSVG characterId={id} stage={0} size={40} animate={false} happiness={80} />
                        <p className="text-xs font-bold text-gray-600">{CHARACTERS[id].evolutionNames[0]}</p>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleAddKid}
                    disabled={!newKidName.trim() || !newKidStarter || addKidLoading}
                    className="w-full bg-purple-600 text-white font-black py-2 rounded-xl disabled:opacity-40 active:scale-95 transition-transform text-sm"
                  >
                    {addKidLoading ? 'Creating...' : 'Create Profile'}
                  </button>
                </div>
              )}

              {kids.map(k => (
                <div key={k.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{k.name}</p>
                    <p className="text-xs text-gray-400">Level {k.accountLevel} · {k.coins} 🪙</p>
                  </div>
                  <button onClick={() => setDeviceLock(k.id)} className="text-xs text-purple-600 font-bold flex items-center gap-1">
                    <Lock size={12} /> Lock device
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
