export default function CoinDisplay({ coins, total = null, large = false }) {
  const showTotal = total !== null && total !== coins
  return (
    <div className={`flex items-center gap-1 font-bold text-amber-600 ${large ? 'text-2xl' : 'text-base'}`}>
      <span>🪙</span>
      <span>{coins}</span>
      {showTotal && (
        <span className={`text-amber-400/60 font-semibold ${large ? 'text-sm' : 'text-xs'}`}>/ {total}</span>
      )}
    </div>
  )
}
