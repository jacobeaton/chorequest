import { useState } from 'react'
import { useAppState } from '../../hooks/useAppState'
import { CHARACTERS } from '../../config/characters'
import { ArrowLeft, Lock, Trash2, Edit2, CheckCircle, XCircle, Star } from 'lucide-react'

export default function ParentModeScreen({ onNavigate }) {
  const { settings, updateSettings, chores, deleteChore, completions, photoQueue, approvePhoto, rejectPhoto } = useAppState()
  const [pin, setPin] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [tab, setTab] = useState('queue') // 'queue' | 'chores' | 'history' | 'settings'
  const [changingPin, setChangingPin] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [revealedPull, setRevealedPull] = useState({})

  const handleUnlock = (e) => {
    e.preventDefault()
    if (pin === settings.parentPin) {
      setUnlocked(true)
      setPinError(false)
    } else {
      setPinError(true)
      setPin('')
    }
  }

  const handleApprove = (photoId) => {
    const pulledId = approvePhoto(photoId)
    setRevealedPull(prev => ({ ...prev, [photoId]: pulledId }))
  }

  const pendingPhotos = photoQueue.filter(p => p.status === 'pending')
  const recentCompletions = [...completions].reverse().slice(0, 20)

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col items-center justify-center px-6">
        <button onClick={() => onNavigate('home')} className="absolute top-10 left-4 bg-white/10 rounded-full p-2">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <Lock size={48} className="text-gray-400 mb-4" />
        <h1 className="text-white font-black text-2xl mb-1">Parent Mode</h1>
        <p className="text-gray-400 text-sm mb-8">Enter your PIN to continue.</p>
        <form onSubmit={handleUnlock} className="w-full max-w-xs space-y-3">
          <input
            autoFocus
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="• • • •"
            className={`w-full text-center text-2xl font-black tracking-[0.5em] bg-gray-700 text-white rounded-2xl px-4 py-4 outline-none border-2 ${pinError ? 'border-red-500' : 'border-gray-600 focus:border-purple-400'}`}
          />
          {pinError && <p className="text-red-400 text-sm text-center font-bold">Wrong PIN. Try again.</p>}
          <button type="submit" className="w-full bg-purple-600 text-white font-black text-lg py-4 rounded-2xl active:scale-95 transition-transform">
            Unlock
          </button>
        </form>
        <p className="text-gray-600 text-xs mt-6">Default PIN: 1234</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-4 pt-10 pb-4 rounded-b-[2rem] shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => onNavigate('home')} className="bg-white/20 rounded-full p-2">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white font-black text-2xl flex-1">Parent Mode</h1>
          <Lock size={18} className="text-gray-400" />
        </div>
        <div className="flex gap-1">
          {['queue','chores','history','settings'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-full text-xs font-bold capitalize transition-colors ${tab === t ? 'bg-white text-gray-700' : 'bg-white/15 text-white'}`}>
              {t === 'queue' ? `📸 Queue${pendingPhotos.length ? ` (${pendingPhotos.length})` : ''}` :
               t === 'chores' ? '📋 Chores' :
               t === 'history' ? '📊 History' : '⚙️ Settings'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8 px-4 py-4">
        {tab === 'queue' && (
          <div className="space-y-4">
            {pendingPhotos.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-2">📸</p>
                <p className="font-bold">No pending photos</p>
                <p className="text-sm">When your kid submits a room photo, it'll appear here.</p>
              </div>
            ) : pendingPhotos.map(photo => (
              <div key={photo.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <img src={photo.photoDataUrl} alt="Room" className="w-full aspect-video object-cover" />
                <div className="p-4 space-y-3">
                  <p className="text-xs text-gray-400">{new Date(photo.submittedAt).toLocaleString()}</p>
                  {revealedPull[photo.id] !== undefined ? (
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      {revealedPull[photo.id] ? (
                        <>
                          <p className="font-black text-green-700">✨ New Lumin found!</p>
                          <p className="text-green-600 font-bold capitalize">{CHARACTERS[revealedPull[photo.id]]?.evolutionNames[0]}</p>
                          <p className="text-xs text-gray-400 mt-1">The kid will see this when they check.</p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-gray-600">Approved — no new Lumin this time.</p>
                          <p className="text-xs text-gray-400">Keep those chores going!</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(photo.id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white font-bold py-2 rounded-xl active:scale-95 transition-transform">
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button onClick={() => rejectPhoto(photo.id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-red-400 text-white font-bold py-2 rounded-xl active:scale-95 transition-transform">
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'chores' && (
          <div className="space-y-2">
            <button onClick={() => onNavigate('add', { createdBy: 'parent' })}
              className="w-full bg-purple-600 text-white font-black py-3 rounded-2xl mb-4 active:scale-95 transition-transform">
              + Add Chore
            </button>
            {chores.map(chore => (
              <div key={chore.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <span className="text-2xl">{chore.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{chore.name}</p>
                  <p className="text-xs text-gray-400">{chore.difficulty} • {chore.estimatedMinutes}min • ⚡{chore.points} • 🪙{chore.coins}</p>
                </div>
                <button onClick={() => deleteChore(chore.id)} className="text-red-400 p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400 mb-3">{completions.length} chores completed total</p>
            {recentCompletions.map(c => {
              const chore = { name: '(deleted)', emoji: '✅' }
              const found = { name: c.choreId }
              return (
                <div key={c.id} className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-700 text-sm">Chore completed</p>
                    <p className="text-xs text-gray-400">{new Date(c.timestamp).toLocaleDateString()} • +{c.pointsEarned} XP • +{c.coinsEarned} 🪙</p>
                  </div>
                  {c.bonusApplied && <Star size={14} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                </div>
              )
            })}
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="font-black text-gray-700">Change PIN</h3>
              {changingPin ? (
                <div className="space-y-2">
                  <input
                    type="password" inputMode="numeric" maxLength={6} value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="New PIN (4–6 digits)"
                    className="w-full border-2 border-purple-200 rounded-xl px-3 py-2 text-lg text-center font-black tracking-widest outline-none focus:border-purple-500"
                  />
                  <div className="flex gap-2">
                    <button
                      disabled={newPin.length < 4}
                      onClick={() => { updateSettings({ parentPin: newPin }); setChangingPin(false); setNewPin('') }}
                      className="flex-1 bg-purple-600 text-white font-bold py-2 rounded-xl disabled:opacity-40"
                    >
                      Save PIN
                    </button>
                    <button onClick={() => setChangingPin(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-2 rounded-xl">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setChangingPin(true)} className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                  <Edit2 size={14} /> Change PIN
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-700">Sound Effects</p>
                <p className="text-xs text-gray-400">Button taps, fanfares, level ups</p>
              </div>
              <button
                onClick={() => updateSettings({ soundOn: !settings.soundOn })}
                className={`w-12 h-6 rounded-full transition-colors ${settings.soundOn ? 'bg-purple-500' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${settings.soundOn ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
