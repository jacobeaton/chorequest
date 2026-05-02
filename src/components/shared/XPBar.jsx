import { BALANCE } from '../../config/balance'

export default function XPBar({ level, xp, small = false }) {
  const pct = Math.min(100, (xp / BALANCE.xpPerLevel) * 100)
  const isMax = level >= BALANCE.maxLevel

  return (
    <div className={small ? 'space-y-0.5' : 'space-y-1'}>
      <div className="flex justify-between items-center">
        <span className={`font-bold text-purple-700 ${small ? 'text-xs' : 'text-sm'}`}>
          Lv.{level}{isMax ? ' MAX' : ''}
        </span>
        {!isMax && (
          <span className={`text-purple-400 ${small ? 'text-xs' : 'text-sm'}`}>
            {xp}/{BALANCE.xpPerLevel} XP
          </span>
        )}
      </div>
      <div className={`bg-purple-100 rounded-full overflow-hidden ${small ? 'h-2' : 'h-3'}`}>
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full transition-all duration-700"
          style={{ width: `${isMax ? 100 : pct}%` }}
        />
      </div>
    </div>
  )
}
