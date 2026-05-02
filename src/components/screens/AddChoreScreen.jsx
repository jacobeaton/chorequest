import { useState } from 'react'
import { useAppState } from '../../hooks/useAppState'
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

export default function AddChoreScreen({ onNavigate, createdBy = 'kid' }) {
  const { addChore } = useAppState()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🧹')
  const [minutes, setMinutes] = useState(10)
  const [difficulty, setDifficulty] = useState('medium')
  const [points, setPoints] = useState(BALANCE.xp.medium)
  const [coins, setCoins] = useState(BALANCE.coins.medium)

  const handleMinutesChange = (val) => {
    setMinutes(val)
    setDifficulty(autoDifficulty(val))
    setPoints(autoPoints(val))
    setCoins(autoCoins(val))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    addChore({ name: name.trim(), emoji, estimatedMinutes: minutes, points, coins, difficulty, createdBy })
    onNavigate('chores')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-violet-600 to-purple-500 px-4 pt-10 pb-5 rounded-b-[2rem] shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('chores')} className="bg-white/20 rounded-full p-2">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white font-black text-2xl">Add Chore</h1>
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
          Add Chore ✅
        </button>
      </form>
    </div>
  )
}
