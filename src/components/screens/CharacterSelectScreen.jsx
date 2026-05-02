import { useState } from 'react'
import { useAppState } from '../../hooks/useAppState'
import { CHARACTERS, STARTERS } from '../../config/characters'
import LuminSVG from '../lumins/LuminSVG'
import { Sparkles } from 'lucide-react'

export default function CharacterSelectScreen() {
  const { setupKid } = useAppState()
  const [name, setName] = useState('')
  const [selected, setSelected] = useState(null)
  const [step, setStep] = useState('name') // 'name' | 'pick'

  const handleNameSubmit = (e) => {
    e.preventDefault()
    if (name.trim().length < 2) return
    setStep('pick')
  }

  const handleConfirm = () => {
    if (!selected) return
    setupKid(name.trim(), selected)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-600 via-purple-500 to-indigo-700 flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-2">✨</div>
        <h1 className="text-4xl font-black text-white drop-shadow-lg">ChoreQuest</h1>
        <p className="text-violet-200 mt-1 text-lg">Clean up. Level up.</p>
      </div>

      {step === 'name' ? (
        <form onSubmit={handleNameSubmit} className="w-full max-w-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-black text-gray-800 mb-1">What's your name?</h2>
            <p className="text-sm text-gray-400 mb-4">Your companion will know you by this.</p>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={20}
              className="w-full border-2 border-purple-200 rounded-2xl px-4 py-3 text-lg font-bold text-gray-800 outline-none focus:border-purple-500 transition-colors"
            />
            <button
              type="submit"
              disabled={name.trim().length < 2}
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-violet-500 text-white font-black text-lg py-3 rounded-2xl disabled:opacity-40 active:scale-95 transition-transform shadow-lg"
            >
              Continue →
            </button>
          </div>
        </form>
      ) : (
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-white">Hey {name}! 👋</h2>
            <p className="text-violet-200 mt-1">Choose your first companion.</p>
          </div>

          <div className="space-y-3">
            {STARTERS.map(id => {
              const char = CHARACTERS[id]
              const isSelected = selected === id
              return (
                <button
                  key={id}
                  onClick={() => setSelected(id)}
                  className={`w-full bg-white rounded-3xl p-4 flex items-center gap-4 transition-all active:scale-95 shadow-lg ${isSelected ? 'ring-4 ring-yellow-400 scale-105' : ''}`}
                >
                  <div className="flex-shrink-0">
                    <LuminSVG characterId={id} stage={0} size={64} animate={isSelected} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-black text-gray-800 text-lg">{char.evolutionNames[0]}</p>
                    <p className="text-xs text-gray-500">{char.element} • {char.rarity}</p>
                    <p className="text-sm text-gray-600 mt-1 italic">"{char.messages[0]}"</p>
                  </div>
                  {isSelected && <Sparkles className="text-yellow-400 flex-shrink-0" size={24} />}
                </button>
              )
            })}
          </div>

          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="w-full mt-6 bg-gradient-to-r from-yellow-400 to-amber-400 text-gray-900 font-black text-xl py-4 rounded-3xl disabled:opacity-40 active:scale-95 transition-transform shadow-xl"
          >
            Start Adventure! 🚀
          </button>
        </div>
      )}
    </div>
  )
}
