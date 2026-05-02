import { useState, useRef } from 'react'
import { useAppState } from '../../hooks/useAppState'
import { CHARACTERS } from '../../config/characters'
import { BALANCE } from '../../config/balance'
import LuminSVG from '../lumins/LuminSVG'
import ConfettiOverlay from '../shared/ConfettiOverlay'
import { ArrowLeft, Camera } from 'lucide-react'

// Deterministic position from photo id so it's the same every render
const getShinyPos = (id) => {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return {
    x: 20 + (hash % 50),
    y: 20 + ((hash * 13) % 50),
  }
}

function PhotoResultScreen({ photo, onNavigate }) {
  const { claimPhotoReward } = useAppState()
  const [tapped, setTapped] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const isCharacter = !!photo.pullResult
  const char = isCharacter ? CHARACTERS[photo.pullResult] : null
  const pos = getShinyPos(photo.id)

  const handleTap = () => {
    if (tapped) return
    setTapped(true)
    claimPhotoReward(photo.id)
    setTimeout(() => setClaimed(true), 600)
  }

  if (claimed) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center px-6 text-center ${isCharacter ? 'bg-gradient-to-b from-indigo-700 to-violet-900' : 'bg-gradient-to-b from-teal-600 to-emerald-700'}`}>
        {isCharacter && <ConfettiOverlay intensity={char?.rarity === 'legendary' ? 'heavy' : 'medium'} />}

        {isCharacter && char ? (
          <>
            <div className="animate-pulse-glow mb-4">
              <LuminSVG characterId={photo.pullResult} stage={0} size={140} animate happiness={80} />
            </div>
            <p className={`text-xs font-black uppercase tracking-widest mb-1 ${rarityTextColor[char.rarity]}`}>
              {char.rarity === 'legendary' ? '⚡ LEGENDARY' : char.rarity === 'rare' ? '💎 RARE' : char.rarity === 'uncommon' ? '🟢 UNCOMMON' : 'COMMON'}
            </p>
            <h1 className="text-white font-black text-4xl">{char.evolutionNames[0]}</h1>
            <p className="text-indigo-200 mt-1">{char.element} Lumin • {char.description}</p>
            <div className="mt-4 bg-white/10 rounded-2xl px-5 py-3 max-w-xs">
              <p className="text-white/80 italic text-sm">"{char.messages[0]}"</p>
            </div>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">🪙</div>
            <h1 className="text-white font-black text-4xl">+{BALANCE.cleanRoomCoins} Coins!</h1>
            <p className="text-emerald-200 mt-2 text-lg">Nice clean room — keep it up!</p>
            <p className="text-emerald-300/70 mt-1 text-sm">No new Lumin today, but coins are still yours.</p>
          </>
        )}

        <button
          onClick={() => isCharacter ? onNavigate('lumin') : onNavigate('home')}
          className="mt-8 bg-white text-gray-900 font-black text-lg px-10 py-4 rounded-3xl shadow-xl active:scale-95 transition-transform"
        >
          {isCharacter ? `Meet ${char?.evolutionNames[0]}! 🎉` : 'Back Home 🏠'}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <p className="text-white font-black text-xl mb-6 text-center">
        ✨ Something's hiding in your room photo!
      </p>

      {/* Photo with shiny spot */}
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
        <img src={photo.photoDataUrl} alt="Your room" className="w-full aspect-video object-cover" />

        {/* Shiny spot */}
        <button
          onClick={handleTap}
          className="absolute"
          style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className={`relative w-12 h-12 rounded-full flex items-center justify-center ${tapped ? 'scale-150 opacity-0' : ''} transition-all duration-500`}>
            {/* Outer pulse ring */}
            <div className={`absolute inset-0 rounded-full animate-ping opacity-60 ${isCharacter ? 'bg-blue-400' : 'bg-white'}`} />
            {/* Inner glow */}
            <div className={`absolute inset-1 rounded-full animate-pulse ${isCharacter ? 'bg-blue-300' : 'bg-gray-100'}`} />
            {/* Core */}
            <div className={`relative w-5 h-5 rounded-full ${isCharacter ? 'bg-blue-200' : 'bg-white'}`}
              style={{ boxShadow: isCharacter ? '0 0 12px 4px rgba(147,197,253,0.8)' : '0 0 12px 4px rgba(255,255,255,0.8)' }}
            />
          </div>
        </button>
      </div>

      <p className={`mt-6 text-sm font-bold animate-bounce ${isCharacter ? 'text-blue-300' : 'text-gray-400'}`}>
        Tap the {isCharacter ? 'blue' : 'white'} glow to reveal!
      </p>
    </div>
  )
}

export default function PhotoSubmitScreen({ onNavigate }) {
  const { submitPhoto, settings, unclaimedPhoto } = useAppState()
  const [preview, setPreview] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef(null)

  // If there's an approved unclaimed photo, show the result screen
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
    const ok = submitPhoto(preview)
    if (ok) setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-500 to-rose-400 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4 animate-bounce">📸</div>
        <h1 className="text-white font-black text-3xl drop-shadow">Photo submitted!</h1>
        <p className="text-pink-100 mt-2 text-lg">Your parent will review it soon.</p>
        <p className="text-pink-200 mt-1 text-sm">Check back here to see if you found something!</p>
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
          <p className="text-gray-400 mt-2">Come back tomorrow to submit another photo.</p>
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

const rarityTextColor = {
  common: 'text-gray-300',
  uncommon: 'text-green-400',
  rare: 'text-blue-300',
  legendary: 'text-yellow-300',
}
