import { useAppState } from '../../hooks/useAppState'
import { CHARACTERS } from '../../config/characters'
import LuminSVG from '../lumins/LuminSVG'
import { Home, Zap, Hourglass } from 'lucide-react'

export default function ChoreCompleteScreen({ chore, result, onNavigate }) {
  const { activeCharacterId, activeCharacter } = useAppState()
  const char = CHARACTERS[activeCharacterId]

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-600 to-purple-500 flex flex-col items-center justify-center px-6 text-center">

      {/* Lumin reaction */}
      <div className="animate-wiggle">
        <LuminSVG characterId={activeCharacterId} stage={activeCharacter?.evolutionStage ?? 0} size={120} animate={false} happiness={activeCharacter?.happiness ?? 80} />
      </div>

      <div className="mt-4 space-y-2">
        <h1 className="text-white font-black text-4xl drop-shadow-lg">
          {result?.beatTimer ? '🏆 Under time!' : '✅ Nice work!'}
        </h1>
        <p className="text-violet-200 text-lg font-semibold">{chore?.name}</p>
      </div>

      {/* Potential rewards — locked until parent approves */}
      <div className="mt-6 flex gap-4">
        <StatPill icon="⚡" label="XP" value={`+${result?.xp ?? 0}`} />
        <StatPill icon="🪙" label="Coins" value={`+${result?.coins ?? 0}`} />
        {result?.beatTimer && <StatPill icon="🚀" label="Bonus" value="×1.5" />}
        {result?.streakActive && <StatPill icon="🔥" label="Streak" value="×2" />}
      </div>

      {/* Pending notice */}
      <div className="mt-6 bg-white/15 rounded-2xl px-5 py-4 max-w-xs w-full flex items-center gap-3">
        <Hourglass size={24} className="text-yellow-300 flex-shrink-0" />
        <div className="text-left">
          <p className="text-white font-black text-sm">Waiting for approval</p>
          <p className="text-violet-200 text-xs mt-0.5">A parent needs to approve this chore before your rewards are added.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 w-full max-w-xs space-y-3">
        <button
          onClick={() => onNavigate('chores')}
          className="w-full bg-white text-purple-600 font-black text-lg py-4 rounded-3xl shadow-xl active:scale-95 transition-transform"
        >
          ⚡ Do Another Chore
        </button>
        <button
          onClick={() => onNavigate('home')}
          className="w-full flex items-center justify-center gap-2 text-white/80 font-bold py-3"
        >
          <Home size={18} /> Back Home
        </button>
      </div>
    </div>
  )
}

const StatPill = ({ icon, label, value }) => (
  <div className="flex flex-col items-center px-4 py-2 rounded-2xl bg-white/20">
    <span className="text-xl">{icon}</span>
    <span className="text-white font-black text-lg">{value}</span>
    <span className="text-white/70 text-xs">{label}</span>
  </div>
)
