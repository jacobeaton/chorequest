import { useState, useRef } from 'react'
import { useAppState } from '../../hooks/useAppState'
import { ArrowLeft, Camera, Upload } from 'lucide-react'

export default function PhotoSubmitScreen({ onNavigate }) {
  const { submitPhoto, settings } = useAppState()
  const [preview, setPreview] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef(null)

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
        <p className="text-pink-200 mt-1 text-sm">If your room is clean, you might find a new companion!</p>
        <button
          onClick={() => onNavigate('home')}
          className="mt-8 bg-white text-pink-600 font-black text-lg px-10 py-4 rounded-3xl shadow-xl active:scale-95 transition-transform"
        >
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
          <p className="text-pink-400 text-xs mt-1">A parent will review it. If it's clean, you might discover a new Lumin companion!</p>
        </div>

        {/* Photo area */}
        <button
          onClick={() => fileRef.current?.click()}
          className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors ${
            preview ? 'border-transparent p-0 overflow-hidden' : 'border-pink-300 bg-pink-50'
          }`}
        >
          {preview ? (
            <img src={preview} alt="Room preview" className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <>
              <Camera size={40} className="text-pink-400" />
              <p className="text-pink-500 font-bold">Tap to take / upload photo</p>
            </>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />

        {preview && (
          <button
            onClick={() => setPreview(null)}
            className="w-full py-2 text-sm text-gray-400 font-semibold"
          >
            ↺ Choose a different photo
          </button>
        )}

        <button
          onClick={handleSubmit}
          disabled={!preview}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-black text-xl py-4 rounded-3xl disabled:opacity-40 active:scale-95 transition-transform shadow-lg"
        >
          <Upload size={20} className="inline mr-2" />
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
