import { Clock, Zap } from 'lucide-react'

const DIFFICULTY_STYLES = {
  easy:   { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200',  label: 'Easy' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Medium' },
  hard:   { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200',    label: 'Hard' },
}

export default function ChoreCard({ chore, onStart, compact = false }) {
  const d = DIFFICULTY_STYLES[chore.difficulty]

  return (
    <button
      onClick={() => onStart?.(chore)}
      className={`w-full text-left rounded-2xl border-2 ${d.border} bg-white shadow-sm active:scale-95 transition-transform ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className="flex items-center gap-3">
        <span className={compact ? 'text-2xl' : 'text-3xl'}>{chore.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-gray-800 truncate ${compact ? 'text-sm' : 'text-base'}`}>{chore.name}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className={`flex items-center gap-1 text-xs text-gray-500`}>
              <Clock size={11} /> {chore.estimatedMinutes}m
            </span>
            <span className={`flex items-center gap-1 text-xs text-purple-600 font-semibold`}>
              <Zap size={11} /> {chore.points} XP
            </span>
            <span className="text-xs text-amber-600 font-semibold">🪙 {chore.coins}</span>
          </div>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${d.bg} ${d.text}`}>{d.label}</span>
      </div>
    </button>
  )
}
