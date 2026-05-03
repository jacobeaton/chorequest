import { useState, useMemo } from 'react'
import { useAppState } from '../../hooks/useAppState'
import { useAuth } from '../../hooks/useAuth'
import { ArrowLeft } from 'lucide-react'
import { BALANCE } from '../../config/balance'

const EMOJIS = ['🛏️','🧹','🍽️','🌀','🗑️','🚿','🧺','🧴','🪣','🧽','🪥','🌿','🐾','📚','🪟','🚪','🥣','🥡','🪴','🧸']

const autoPoints = (minutes) => {
  if (minutes <= 5) return BALANCE.xp.easy
  if (minutes <= 15) return BALANCE.xp.medium
  return BALANCE.xp.hard
}
const autoCoins = (minutes) => {
  if (minutes <= 5) return BALANCE.coins.easy
  if (minutes <= 15) return BALANCE.coins.medium
  return BALANCE.coins.hard
}
const autoDifficulty = (minutes) => {
  if (minutes <= 5) return 'easy'
  if (minutes <= 15) return 'medium'
  return 'hard'
}

export default function AddChoreScreen({ onNavigate, createdBy = 'kid', existingChore = null }) {
  const { addChore, updateChore } = useAppState()
  const { kids } = useAuth()
  const isEditing = !!existingChore
  const [name, setName] = useState(existingChore?.name ?? '')
  const [emoji, setEmoji] = useState(existingChore?.emoji ?? '🧹')
  const [minutes, setMinutes] = useState(existingChore?.estimatedMinutes ?? 10)
  const [difficulty, setDifficulty] = useState(existingChore?.difficulty ?? 'medium')
  const [points, setPoints] = useState(existingChore?.points ?? BALANCE.xp.medium)
  const [coins, setCoins] = useState(existingChore?.coins ?? BALANCE.coins.medium)
  // Pre-fill assignment: null = all kids, specific id = just that kid
  const [selectedKidIds, setSelectedKidIds] = useState(() => {
    if (existingChore?.assignedKidId) return [existingChore.assignedKidId]
    return kids.map(k => k.id)
  })

  // Keep selection in sync if kids load after mount
  const allKidIds = useMemo(() => kids.map(k => k.id), [kids])

  const toggleKid = (id) => {
    setSelectedKidIds(prev =>
      prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
    )
  }

  const handleMinutesChange = (val) => {
    setMinutes(val)
    setDifficulty(autoDifficulty(val))
    setPoints(autoPoints(val))
    setCoins(autoCoins(val))
  }

  // Derive assignedKidId from selection:
  // all selected → null (any kid), exactly one → that kid's id, none → null
  const assignedKidId = useMemo(() => {
    if (selectedKidIds.length === 0 || selectedKidIds.length === allKidIds.length) return null
    if (selectedKidIds.length === 1) return selectedKidIds[0]
    return null // partial multi-select falls back to all
  }, [selectedKidIds, allKidIds])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    if (isEditing) {
      updateChore(existingChore.id, { name: name.trim(), emoji, estimatedMinutes: minutes, points, coins, difficulty, assignedKidId })
    } else {
      addChore({ name: name.trim(), emoji, estimatedMinutes: minutes, points, coins, difficulty, createdBy, assignedKidId })
    }
    onNavigate(createdBy === 'parent' ? 'home' : 'chores')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-violet-600 to-purple-500 px-4 pt-10 pb-5 rounded-b-[2rem] shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate(createdBy === 'parent' ? 'home' : 'chores')} className="bg-white/20 rounded-full p-2">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white font-black text-2xl">{isEditing ? 'Edit Chore' : 'Add Chore'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-6 space-y-5">
        {/* Chore name */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
          <label className="text-sm font-bold text-gray-600">Chore Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Clean my room"
            maxLength={40}
            className="w-full border-2 border-purple-100 rounded-xl px-3 py-2 font-bold text-gray-800 outline-none focus:border-purple-400"
          />
        </div>

        {/* Emoji picker */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
          <label className="text-sm font-bold text-gray-600">Pick an Icon</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(e => (
              <button
                key={e} type="button"
                onClick={() => setEmoji(e)}
                className={`text-2xl p-1.5 rounded-xl transition-colors ${emoji === e ? 'bg-purple-100 ring-2 ring-purple-400' : 'hover:bg-gray-100'}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Time */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-bold text-gray-600">Estimated Time</label>
            <span className="text-purple-600 font-black">{minutes} min</span>
          </div>
          <input
            type="range" min="1" max="60" value={minutes}
            onChange={e => handleMinutesChange(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1 min</span><span>60 min</span>
          </div>
        </div>

        {/* Difficulty */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
          <label className="text-sm font-bold text-gray-600">Difficulty</label>
          <div className="flex gap-2">
            {['easy','medium','hard'].map(d => (
              <button
                key={d} type="button"
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 rounded-xl font-bold text-sm capitalize transition-colors ${
                  difficulty === d
                    ? d === 'easy' ? 'bg-green-500 text-white' : d === 'medium' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Kid assignment — only shown for parent chores when there are multiple kids */}
        {createdBy === 'parent' && kids.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-600">Assign To</label>
              <button
                type="button"
                onClick={() => setSelectedKidIds(selectedKidIds.length > 0 ? [] : allKidIds)}
                className="text-xs font-bold text-purple-500"
              >
                {selectedKidIds.length > 0 ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {kids.map(k => {
                const checked = selectedKidIds.includes(k.id)
                return (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => toggleKid(k.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors border-2 ${
                      checked
                        ? 'bg-purple-100 border-purple-400 text-purple-700'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}
                  >
                    {checked ? '✓ ' : ''}{k.name}
                  </button>
                )
              })}
            </div>
            {selectedKidIds.length === 0 && (
              <p className="text-xs text-amber-500 font-semibold">No kids selected — chore won't appear for anyone.</p>
            )}
          </div>
        )}

        {/* Rewards preview */}
        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 flex justify-around">
          <div className="text-center">
            <p className="text-purple-600 font-black text-xl">⚡ {points}</p>
            <p className="text-xs text-gray-500">XP earned</p>
          </div>
          <div className="text-center">
            <p className="text-amber-600 font-black text-xl">🪙 {coins}</p>
            <p className="text-xs text-gray-500">Coins earned</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-violet-500 text-white font-black text-xl py-4 rounded-3xl disabled:opacity-40 active:scale-95 transition-transform shadow-lg"
        >
          {isEditing ? 'Save Changes ✅' : 'Add Chore ✅'}
        </button>
      </form>
    </div>
  )
}
