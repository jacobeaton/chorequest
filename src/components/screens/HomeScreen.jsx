import { useAppState } from '../../hooks/useAppState'
import { CHARACTERS } from '../../config/characters'
import LuminSVG from '../lumins/LuminSVG'
import XPBar from '../shared/XPBar'
import HappinessBar from '../shared/HappinessBar'
import CoinDisplay from '../shared/CoinDisplay'
import ChoreCard from '../shared/ChoreCard'
import { Settings, Camera, Star } from 'lucide-react'

export default function HomeScreen({ onNavigate }) {
  const { kid, activeCharacter, activeCharacterId, chores, streaks, pendingPhotoCount } = useAppState()
  const char = CHARACTERS[activeCharacterId]
  if (!char || !activeCharacter) return null

  const displayName = activeCharacter.nickname ?? char.evolutionNames[activeCharacter.evolutionStage]
  const todayStr = new Date().toISOString().split('T')[0]
  const todayChores = chores.slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-500 px-4 pt-10 pb-6 rounded-b-[2rem] shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-violet-200 text-sm font-semibold">Hey {kid?.name}! 👋</p>
            <h1 className="text-white font-black text-2xl">{displayName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <CoinDisplay coins={kid?.coins ?? 0} />
            <button onClick={() => onNavigate('parent')} className="relative bg-white/20 rounded-full p-2">
              <Settings size={20} className="text-white" />
              {pendingPhotoCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingPhotoCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Pet area */}
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('lumin')} className="flex-shrink-0">
            <LuminSVG characterId={activeCharacterId} stage={activeCharacter.evolutionStage} size={100} animate happiness={activeCharacter.happiness} />
          </button>
          <div className="flex-1 space-y-2">
            <XPBar level={activeCharacter.level} xp={activeCharacter.xp} />
            <HappinessBar happiness={activeCharacter.happiness} />
            {streaks.currentStreak >= 3 && (
              <div className="flex items-center gap-1 text-yellow-300 text-xs font-bold">
                <Star size={12} fill="currentColor" /> {streaks.currentStreak} day streak!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 py-6 space-y-6">
        {/* Big CTA */}
        <button
          onClick={() => onNavigate('chores')}
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-400 text-white font-black text-xl py-5 rounded-3xl shadow-lg active:scale-95 transition-transform"
        >
          ⚡ Start a Chore!
        </button>

        {/* Today's chores preview */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-black text-gray-800 text-lg">Today's Chores</h2>
            <button onClick={() => onNavigate('chores')} className="text-purple-500 font-bold text-sm">See all</button>
          </div>
          <div className="space-y-2">
            {todayChores.map(chore => (
              <ChoreCard key={chore.id} chore={chore} onStart={() => onNavigate('active', { chore })} compact />
            ))}
          </div>
        </div>

        {/* Submit room photo */}
        <button
          onClick={() => onNavigate('photo')}
          className="w-full flex items-center gap-3 bg-gradient-to-r from-pink-100 to-rose-100 border-2 border-pink-200 rounded-2xl p-4 active:scale-95 transition-transform"
        >
          <Camera size={28} className="text-pink-500 flex-shrink-0" />
          <div className="text-left">
            <p className="font-black text-pink-700">Clean Room Photo</p>
            <p className="text-xs text-pink-400">Submit daily for a chance to find a new companion!</p>
          </div>
          <span className="ml-auto text-2xl">✨</span>
        </button>
      </div>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 bg-white border-t border-gray-100 flex justify-around py-3 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <NavBtn emoji="🏠" label="Home" active onClick={() => {}} />
        <NavBtn emoji="📋" label="Chores" onClick={() => onNavigate('chores')} />
        <NavBtn emoji="🐾" label="Lumins" onClick={() => onNavigate('lumin')} />
        <NavBtn emoji="➕" label="Add" onClick={() => onNavigate('add')} />
      </nav>
    </div>
  )
}

const NavBtn = ({ emoji, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 px-3 ${active ? 'text-purple-600' : 'text-gray-400'}`}>
    <span className="text-xl">{emoji}</span>
    <span className={`text-xs font-bold ${active ? 'text-purple-600' : 'text-gray-400'}`}>{label}</span>
  </button>
)
