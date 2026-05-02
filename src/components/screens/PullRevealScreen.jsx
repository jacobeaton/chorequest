import { useState } from 'react'
import { CHARACTERS } from '../../config/characters'
import LuminSVG from '../lumins/LuminSVG'
import ConfettiOverlay from '../shared/ConfettiOverlay'

export default function PullRevealScreen({ characterId, onNavigate }) {
  const [tapped, setTapped] = useState(false)
  const char = CHARACTERS[characterId]

  const rarityColors = {
    common: 'from-gray-700 to-gray-800',
    uncommon: 'from-green-700 to-emerald-800',
    rare: 'from-blue-700 to-indigo-800',
    legendary: 'from-purple-700 to-violet-900',
  }

  const bgClass = tapped && char ? rarityColors[char.rarity] : 'from-gray-900 to-black'

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgClass} flex flex-col items-center justify-center px-6 text-center transition-colors duration-700`}>
      {tapped && char && <ConfettiOverlay intensity={char.rarity === 'legendary' ? 'heavy' : char.rarity === 'rare' ? 'heavy' : 'medium'} />}

      {!tapped ? (
        <button
          onClick={() => setTapped(true)}
          className="flex flex-col items-center gap-6 group"
        >
          <div className="text-6xl animate-pulse">✨</div>
          <div className="relative w-40 h-40 bg-gradient-to-br from-yellow-400/20 to-amber-300/10 rounded-full border-2 border-yellow-400/30 flex items-center justify-center animate-pulse-glow">
            <div className="absolute inset-0 rounded-full bg-yellow-400/5 animate-ping" />
            <span className="text-5xl">🌟</span>
          </div>
          <div>
            <p className="text-white font-black text-2xl">Something's here!</p>
            <p className="text-yellow-300 font-semibold mt-1 animate-bounce">Tap to reveal ✨</p>
          </div>
        </button>
      ) : char ? (
        <div className="space-y-6">
          <div className="animate-pulse-glow">
            <LuminSVG characterId={characterId} stage={0} size={160} animate happiness={80} />
          </div>
          <div>
            <p className={`text-sm font-black uppercase tracking-widest mb-2 ${rarityTextColors[char.rarity]}`}>
              {char.rarity === 'legendary' ? '⚡ LEGENDARY' : char.rarity === 'rare' ? '💎 RARE' : char.rarity === 'uncommon' ? '🟢 UNCOMMON' : 'COMMON'}
            </p>
            <h1 className="text-white font-black text-4xl drop-shadow-lg">{char.evolutionNames[0]}</h1>
            <p className="text-gray-300 mt-1 text-lg">{char.element} Lumin</p>
            <p className="text-gray-400 mt-2 italic text-sm">"{char.description}"</p>
          </div>
          <div className="bg-white/10 rounded-2xl px-5 py-3 max-w-xs">
            <p className="text-white/80 italic text-sm">"{char.messages[0]}"</p>
          </div>
          <button
            onClick={() => onNavigate('lumin')}
            className="bg-white text-gray-900 font-black text-lg px-10 py-4 rounded-3xl shadow-xl active:scale-95 transition-transform"
          >
            Meet {char.evolutionNames[0]}! 🎉
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-white font-black text-2xl">Oops!</p>
          <p className="text-gray-400 mt-2">Something went wrong with the reveal.</p>
          <button onClick={() => onNavigate('home')} className="mt-6 text-purple-300 font-bold">← Go Home</button>
        </div>
      )}
    </div>
  )
}

const rarityTextColors = {
  common: 'text-gray-300',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  legendary: 'text-yellow-300',
}
