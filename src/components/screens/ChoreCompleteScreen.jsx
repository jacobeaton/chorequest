import { useEffect } from 'react'
import { useAppState } from '../../hooks/useAppState'
import { CHARACTERS } from '../../config/characters'
import LuminSVG from '../lumins/LuminSVG'
import ConfettiOverlay from '../shared/ConfettiOverlay'
import { Home, Zap } from 'lucide-react'

export default function ChoreCompleteScreen({ chore, result, onNavigate }) {
  const { activeCharacterId, activeCharacter } = useAppState()
  const char = CHARACTERS[activeCharacterId]

  // If an evolution happened, redirect after a brief moment to show it
  useEffect(() => {
    if (result?.evolved) {
      const t = setTimeout(() => onNavigate('evolve', {
        characterId: activeCharacterId,
        newStage: result.evolutionStage,
        newLevel: result.newLevel,
      }), 2500)
      return () => clearTimeout(t)
    }
  }, [result, activeCharacterId, onNavigate])

  const completeMsg = char?.completeMessages[Math.floor(Math.random() * (char?.completeMessages.length ?? 1))]

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-600 to-purple-500 flex flex-col items-center justify-center px-6 text-center">
      <ConfettiOverlay intensity={result?.beatTimer ? 'heavy' : 'medium'} />

      {/* Lumin reaction */}
      <div className="animate-wiggle">
        <LuminSVG characterId={activeCharacterId} stage={activeCharacter?.evolutionStage ?? 0} size={120} animate={false} happiness={activeCharacter?.happiness ?? 80} />
      </div>

      <div className="mt-4 space-y-2">
        <h1 className="text-white font-black text-4xl drop-shadow-lg">
          {result?.beatTimer ? '🏆 BONUS!' : '🎉 Done!'}
        </h1>
        <p className="text-violet-200 text-lg font-semibold">{chore.name}</p>
      </div>

      {/* Stats */}
      <div className="mt-6 flex gap-4">
        <StatPill icon="⚡" label="XP" value={`+${result?.xp ?? 0}`} color="bg-purple-400/40" />
        <StatPill icon="🪙" label="Coins" value={`+${result?.coins ?? 0}`} color="bg-amber-400/40" />
        {result?.beatTimer && <StatPill icon="🚀" label="Bonus" value="×1.5" color="bg-green-400/40" />}
        {result?.streakActive && <StatPill icon="🔥" label="Streak" value="×2" color="bg-orange-400/40" />}
      </div>

      {/* Pet message */}
      <div className="mt-6 bg-white/15 rounded-2xl px-5 py-3 max-w-xs">
        <p className="text-white font-bold text-sm">"{completeMsg}"</p>
      </div>

      {result?.evolved && (
        <div className="mt-4 bg-yellow-300/20 border border-yellow-300/50 rounded-2xl px-5 py-3 animate-pulse-glow">
          <p className="text-yellow-300 font-black">✨ Something is happening...</p>
        </div>
      )}

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

const StatPill = ({ icon, label, value, color }) => (
  <div className={`flex flex-col items-center px-4 py-2 rounded-2xl ${color}`}>
    <span className="text-xl">{icon}</span>
    <span className="text-white font-black text-lg">{value}</span>
    <span className="text-white/70 text-xs">{label}</span>
  </div>
)
