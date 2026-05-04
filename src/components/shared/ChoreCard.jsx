import { Clock, Zap, Lock, Hourglass } from 'lucide-react'

const DIFFICULTY_STYLES = {
  easy:   { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200',  label: 'Easy' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Medium' },
  hard:   { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200',    label: 'Hard' },
}

const FREQ_BADGE = {
  weekly:   { label: 'Weekly',   style: 'bg-blue-100 text-blue-600' },
  one_time: { label: 'One-time', style: 'bg-orange-100 text-orange-600' },
}

export default function ChoreCard({ chore, onStart, compact = false, status = null }) {
  // status: null = available, 'pending' = awaiting approval, 'approved' = done today
  const d = DIFFICULTY_STYLES[chore.difficulty]
  const locked = status === 'pending' || status === 'approved'
  const freqBadge = FREQ_BADGE[chore.frequency]

  return (
    <button
      onClick={() => !locked && onStart?.(chore)}
      disabled={locked}
      className={`w-full text-left rounded-2xl border-2 bg-white shadow-sm transition-transform ${compact ? 'p-3' : 'p-4'} ${
        locked ? 'opacity-60 border-gray-200' : `${d.border} active:scale-95`
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={compact ? 'text-2xl' : 'text-3xl'}>{chore.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-gray-800 truncate ${compact ? 'text-sm' : 'text-base'}`}>{chore.name}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={11} /> {chore.estimatedMinutes}m
            </span>
            <span className="flex items-center gap-1 text-xs text-purple-600 font-semibold">
              <Zap size={11} /> {chore.points} XP
            </span>
            <span className="text-xs text-amber-600 font-semibold">🪙 {chore.coins}</span>
            {freqBadge && !locked && (
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${freqBadge.style}`}>{freqBadge.label}</span>
            )}
          </div>
        </div>
        {locked ? (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
          }`}>
            {status === 'pending' ? <><Hourglass size={11} /> Pending</> : <><Lock size={11} /> Done</>}
          </div>
        ) : (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${d.bg} ${d.text}`}>{d.label}</span>
        )}
      </div>
    </button>
  )
}
