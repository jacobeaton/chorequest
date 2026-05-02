import { getHappinessTier, getHappinessBarColor } from '../../utils/happinessCalc'

const EMOJI = { happy: '😄', content: '😊', sad: '😴' }
const LABEL = { happy: 'Happy', content: 'Content', sad: 'Sad' }

export default function HappinessBar({ happiness, small = false }) {
  const tier = getHappinessTier(happiness)
  const barColor = getHappinessBarColor(happiness)

  return (
    <div className={small ? 'space-y-0.5' : 'space-y-1'}>
      <div className="flex justify-between items-center">
        <span className={`font-bold text-gray-600 ${small ? 'text-xs' : 'text-sm'}`}>
          {EMOJI[tier]} {LABEL[tier]}
        </span>
        <span className={`text-gray-400 ${small ? 'text-xs' : 'text-sm'}`}>{happiness}/100</span>
      </div>
      <div className={`bg-gray-100 rounded-full overflow-hidden ${small ? 'h-2' : 'h-3'}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${happiness}%` }}
        />
      </div>
    </div>
  )
}
