import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppState } from '../../hooks/useAppState'
import { CHARACTERS } from '../../config/characters'
import LuminSVG from '../lumins/LuminSVG'
import { Pause, Play, CheckCircle, X } from 'lucide-react'

const pad = n => String(n).padStart(2, '0')
const fmt = s => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`

export default function ActiveChoreScreen({ chore, onNavigate }) {
  const { activeCharacterId, activeCharacter, completeChore, settings } = useAppState()
  const char = CHARACTERS[activeCharacterId]
  const totalSeconds = chore.estimatedMinutes * 60

  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)
  const [showMsg, setShowMsg] = useState(true)
  const intervalRef = useRef(null)
  const msgIntervalRef = useRef(null)

  const messages = char?.messages ?? []

  const cycleMessage = useCallback(() => {
    setShowMsg(false)
    setTimeout(() => {
      setMsgIndex(i => (i + 1) % messages.length)
      setShowMsg(true)
    }, 300)
  }, [messages.length])

  useEffect(() => {
    if (paused) return
    intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(intervalRef.current)
  }, [paused])

  useEffect(() => {
    if (paused) return
    msgIntervalRef.current = setInterval(cycleMessage, 15000)
    return () => clearInterval(msgIntervalRef.current)
  }, [paused, cycleMessage])

  const handleDone = () => {
    const result = completeChore(chore.id, elapsed)
    onNavigate('complete', { chore, result })
  }

  const remaining = Math.max(0, totalSeconds - elapsed)
  const overTime = elapsed > totalSeconds
  const progressPct = Math.min(100, (elapsed / totalSeconds) * 100)

  const bgColor = overTime ? 'from-orange-500 to-red-500' : 'from-teal-500 to-emerald-500'

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgColor} flex flex-col`}>
      {/* Top bar */}
      <div className="flex justify-between items-center px-4 pt-10 pb-4">
        <button
          onClick={() => onNavigate('chores')}
          className="bg-white/20 rounded-full p-2"
        >
          <X size={20} className="text-white" />
        </button>
        <div className="text-center">
          <p className="text-white/80 text-sm font-semibold">{chore.emoji} {chore.name}</p>
        </div>
        <div className="w-9" />
      </div>

      {/* Timer */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {/* Circular timer */}
        <div className="relative">
          <svg width="200" height="200" className="-rotate-90">
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="12" />
            <circle
              cx="100" cy="100" r="90"
              fill="none"
              stroke="white"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - progressPct / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white font-black text-5xl tabular-nums">
              {overTime ? '+' + fmt(elapsed - totalSeconds) : fmt(remaining)}
            </span>
            <span className="text-white/70 text-sm mt-1">
              {overTime ? 'over time' : 'remaining'}
            </span>
          </div>
        </div>

        {/* Lumin */}
        <div className={paused ? 'opacity-50' : 'animate-bob'}>
          <LuminSVG characterId={activeCharacterId} stage={activeCharacter?.evolutionStage ?? 0} size={90} animate={!paused} happiness={activeCharacter?.happiness ?? 80} />
        </div>

        {/* Encouragement message */}
        <div className={`transition-opacity duration-300 text-center px-4 ${showMsg ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-white font-black text-xl leading-snug drop-shadow">
            {messages[msgIndex]}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 pb-10 space-y-3">
        <button
          onClick={handleDone}
          className="w-full bg-white text-teal-600 font-black text-xl py-5 rounded-3xl shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <CheckCircle size={24} /> Done!
        </button>
        <button
          onClick={() => setPaused(p => !p)}
          className="w-full bg-white/20 text-white font-bold text-lg py-3 rounded-3xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          {paused ? <><Play size={20} /> Resume</> : <><Pause size={20} /> Pause</>}
        </button>
      </div>
    </div>
  )
}
