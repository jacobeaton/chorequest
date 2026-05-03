import { useState, useRef, useEffect } from 'react'
import { useAppState } from '../../hooks/useAppState'
import { CHARACTERS } from '../../config/characters'
import { BALANCE } from '../../config/balance'
import LuminSVG from '../lumins/LuminSVG'
import ConfettiOverlay from '../shared/ConfettiOverlay'
import { ArrowLeft, Camera } from 'lucide-react'

const getShinyPos = (id) => {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return { x: 20 + (hash % 50), y: 20 + ((hash * 13) % 50) }
}

const rarityTextColor = {
  common: 'text-gray-300',
  uncommon: 'text-green-400',
  rare: 'text-blue-300',
  legendary: 'text-yellow-300',
}
const rarityBg = {
  common: 'from-gray-700 to-gray-900',
  uncommon: 'from-green-800 to-emerald-900',
  rare: 'from-blue-800 to-indigo-900',
  legendary: 'from-purple-800 to-violet-900',
}
const rarityLabel = {
  common: 'COMMON',
  uncommon: '🟢 UNCOMMON',
  rare: '💎 RARE',
  legendary: '⚡ LEGENDARY',
}

// ─── Photo result (approved, unclaimed) ──────────────────────────────────────

function PhotoResultScreen({ photo, onNavigate }) {
  const { claimPhotoReward } = useAppState()
  // stage: 'photo' → 'flash' → 'reveal'
  const [stage, setStage] = useState('photo')
  const isCharacter = !!photo.pullResult
  const char = isCharacter ? CHARACTERS[photo.pullResult] : null
  const pos = getShinyPos(photo.id)

  const handleShinyTap = () => {
    if (stage !== 'photo') return
    claimPhotoReward(photo.id)
    setStage('flash')
    setTimeout(() => setStage('reveal'), 600)
  }

  // Flash screen
  if (stage === 'flash') {
    return <div className="min-h-screen bg-white flex items-center justify-center animate-flash" />
  }

  // Full reveal screen
  if (stage === 'reveal') {
    if (isCharacter && char) {
      return (
        <div className={`min-h-screen bg-gradient-to-b ${rarityBg[char.rarity]} flex flex-col items-center justify-center px-6 text-center`}>
          <ConfettiOverlay intensity={char.rarity === 'legendary' ? 'heavy' : char.rarity === 'rare' ? 'heavy' : 'medium'} />

          {/* Rarity badge */}
          <p className={`text-xs font-black uppercase tracking-widest mb-4 ${rarityTextColor[char.rarity]}`}>
            {rarityLabel[char.rarity]}
          </p>

          {/* Lumin */}
          <div className="animate-pulse-glow mb-6">
            <LuminSVG characterId={photo.pullResult} stage={0} size={160} animate happiness={80} />
          </div>

          {/* Name & info */}
          <h1 className="text-white font-black text-5xl drop-shadow-lg">{char.evolutionNames[0]}</h1>
          <p className="text-white/60 text-lg mt-1">{char.element} Lumin</p>
          <p className="text-white/50 mt-1 italic text-sm">{char.description}</p>

          {/* First message */}
          <div className="mt-5 bg-white/10 rounded-2xl px-5 py-3 max-w-xs w-full">
            <p className="text-white/80 italic text-sm">"{char.messages[0]}"</p>
          </div>

          <button
            onClick={() => onNavigate('lumin')}
            className="mt-8 bg-white text-gray-900 font-black text-xl px-12 py-4 rounded-3xl shadow-2xl active:scale-95 transition-transform"
          >
            Meet {char.evolutionNames[0]}! 🎉
          </button>
          <button onClick={() => onNavigate('home')} className="mt-3 text-white/50 text-sm font-semibold py-2">
            Back Home
          </button>
        </div>
      )
    }

    // Coins reveal (miss)
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-700 to-emerald-900 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-7xl mb-4 animate-bounce">🪙</div>
        <h1 className="text-white font-black text-4xl drop-shadow">+{BALANCE.cleanRoomCoins} Coins!</h1>
        <p className="text-teal-200 mt-3 text-lg font-semibold">Your room looks great!</p>
        <p className="text-teal-300/60 mt-1 text-sm">No new Lumin this time — keep cleaning for another chance!</p>
        <button
          onClick={() => onNavigate('home')}
          className="mt-10 bg-white text-teal-700 font-black text-xl px-12 py-4 rounded-3xl shadow-xl active:scale-95 transition-transform"
        >
          Back Home 🏠
        </button>
      </div>
    )
  }

  // Photo with shiny spot
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="bg-gray-900 px-4 pt-10 pb-4">
        <button onClick={() => onNavigate('home')} className="bg-white/10 rounded-full p-2 inline-flex">
          <ArrowLeft size={20} className="text-white" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        <p className="text-white font-black text-xl text-center">
          ✨ Something's hiding in your clean room!
        </p>

        <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
          <img src={photo.photoDataUrl} alt="Your room" className="w-full aspect-video object-cover" />
          <button
            onClick={handleShinyTap}
            className="absolute"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <span className="relative flex w-14 h-14 items-center justify-center">
              <span className={`absolute inset-0 rounded-full animate-ping opacity-50 ${isCharacter ? 'bg-blue-400' : 'bg-white'}`} />
              <span className={`absolute inset-2 rounded-full animate-pulse ${isCharacter ? 'bg-blue-300' : 'bg-gray-100'}`} />
              <span
                className={`relative w-6 h-6 rounded-full ${isCharacter ? 'bg-blue-200' : 'bg-white'}`}
                style={{ boxShadow: isCharacter ? '0 0 16px 6px rgba(147,197,253,0.9)' : '0 0 16px 6px rgba(255,255,255,0.9)' }}
              />
            </span>
          </button>
        </div>

        <p className={`text-sm font-bold animate-bounce ${isCharacter ? 'text-blue-300' : 'text-gray-400'}`}>
          Tap the {isCharacter ? 'blue' : 'white'} glow to reveal!
        </p>
      </div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PhotoSubmitScreen({ onNavigate }) {
  const { submitPhoto, settings, unclaimedPhoto } = useAppState()
  const [preview, setPreview] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef(null)

  if (unclaimedPhoto) {
    return <PhotoResultScreen photo={unclaimedPhoto} onNavigate={onNavigate} />
  }

  const today = new Date().toISOString().split('T')[0]
  const alreadySubmitted = settings.lastPhotoSubmissionDate === today

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (!preview) return
    if (submitPhoto(preview)) setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-500 to-rose-400 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4 animate-bounce">📸</div>
        <h1 className="text-white font-black text-3xl drop-shadow">Photo submitted!</h1>
        <p className="text-pink-100 mt-2 text-lg">Your parent will review it soon.</p>
        <p className="text-pink-200 mt-1 text-sm">Check back here to see what you found!</p>
        <button onClick={() => onNavigate('home')} className="mt-8 bg-white text-pink-600 font-black text-lg px-10 py-4 rounded-3xl shadow-xl active:scale-95 transition-transform">
          Back Home 🏠
        </button>
      </div>
    )
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header onBack={() => onNavigate('home')} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-5xl mb-4">⏰</div>
          <h2 className="text-xl font-black text-gray-700">Already submitted today!</h2>
          <p className="text-gray-400 mt-2">Come back tomorrow for another chance.</p>
          <button onClick={() => onNavigate('home')} className="mt-6 text-purple-500 font-bold">← Back Home</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onBack={() => onNavigate('home')} />
      <div className="flex-1 px-4 py-6 space-y-5">
        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4">
          <p className="text-pink-700 font-bold text-sm">📸 Take a photo of your clean room!</p>
          <p className="text-pink-400 text-xs mt-1">A parent will review it. You might discover a new Lumin — or earn coins!</p>
        </div>

        <button
          onClick={() => fileRef.current?.click()}
          className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors ${
            preview ? 'border-transparent p-0 overflow-hidden' : 'border-pink-300 bg-pink-50'
          }`}
        >
          {preview
            ? <img src={preview} alt="Room preview" className="w-full h-full object-cover rounded-2xl" />
            : <><Camera size={40} className="text-pink-400" /><p className="text-pink-500 font-bold">Tap to take / upload photo</p></>
          }
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />

        {preview && (
          <button onClick={() => setPreview(null)} className="w-full py-2 text-sm text-gray-400 font-semibold">
            ↺ Choose a different photo
          </button>
        )}

        <button
          onClick={handleSubmit}
          disabled={!preview}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-black text-xl py-4 rounded-3xl disabled:opacity-40 active:scale-95 transition-transform shadow-lg"
        >
          Submit for Review
        </button>
      </div>
    </div>
  )
}

const Header = ({ onBack }) => (
  <div className="bg-gradient-to-r from-pink-500 to-rose-400 px-4 pt-10 pb-5 rounded-b-[2rem] shadow-md">
    <div className="flex items-center gap-3">
      <button onClick={onBack} className="bg-white/20 rounded-full p-2">
        <ArrowLeft size={20} className="text-white" />
      </button>
      <h1 className="text-white font-black text-2xl">Clean Room Photo</h1>
    </div>
  </div>
)
