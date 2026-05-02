import { useState, useEffect } from 'react'
import { CHARACTERS } from '../../config/characters'
import LuminSVG from '../lumins/LuminSVG'
import ConfettiOverlay from '../shared/ConfettiOverlay'

const STAGES = ['waiting', 'shaking', 'flash', 'reveal']

export default function EvolutionRevealScreen({ characterId, newStage, newLevel, onNavigate }) {
  const [stage, setStage] = useState('waiting')
  const char = CHARACTERS[characterId]

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage('shaking'), 800),
      setTimeout(() => setStage('flash'), 2000),
      setTimeout(() => setStage('reveal'), 2500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  if (!char) return null
  const newName = char.evolutionNames[newStage]
  const prevStage = newStage - 1

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-6 text-center transition-colors duration-500 ${
      stage === 'flash' ? 'bg-white' : 'bg-gray-950'
    }`}>
      {stage === 'reveal' && <ConfettiOverlay intensity="heavy" />}

      {stage !== 'flash' && (
        <>
          {(stage === 'waiting' || stage === 'shaking') && (
            <div className="space-y-6">
              <p className="text-gray-400 text-lg font-semibold animate-pulse">Wait...</p>
              <p className="text-white font-black text-2xl">Something's happening to {char.evolutionNames[prevStage]}!</p>
              <div className={stage === 'shaking' ? 'animate-shake' : 'animate-bob'}>
                <LuminSVG characterId={characterId} stage={prevStage} size={140} animate={false} />
              </div>
              <div className="flex gap-1 justify-center">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {stage === 'reveal' && (
            <div className="space-y-6">
              <div className="animate-pulse-glow">
                <LuminSVG characterId={characterId} stage={newStage} size={160} animate happiness={90} />
              </div>
              <div>
                <p className="text-purple-300 text-lg font-semibold uppercase tracking-widest mb-2">
                  {newLevel >= 30 ? '⚡ MAX EVOLUTION' : '✨ Evolution!'}
                </p>
                <h1 className="text-white font-black text-4xl drop-shadow-[0_0_30px_rgba(167,139,250,0.8)]">
                  {newName}!
                </h1>
                <p className="text-gray-300 mt-2 text-lg">
                  {char.evolutionNames[prevStage]} has evolved into <strong className="text-purple-300">{newName}</strong>!
                </p>
              </div>
              <div className="bg-purple-900/50 rounded-2xl px-5 py-3 max-w-xs">
                <p className="text-purple-200 italic text-sm">"{char.messages[Math.floor(Math.random() * char.messages.length)]}"</p>
              </div>
              <button
                onClick={() => onNavigate('home')}
                className="mt-4 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-black text-xl px-10 py-4 rounded-3xl shadow-[0_0_40px_rgba(139,92,246,0.5)] active:scale-95 transition-transform"
              >
                Amazing! 🚀
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
