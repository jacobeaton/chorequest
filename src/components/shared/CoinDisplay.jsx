export default function CoinDisplay({ coins, large = false }) {
  return (
    <div className={`flex items-center gap-1 font-bold text-amber-600 ${large ? 'text-2xl' : 'text-base'}`}>
      <span>🪙</span>
      <span>{coins}</span>
    </div>
  )
}
