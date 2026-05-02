import { useState } from 'react'
import { useAppState } from '../../hooks/useAppState'
import { CHARACTERS } from '../../config/characters'
import { SHOP_ITEMS } from '../../config/balance'
import LuminSVG from '../lumins/LuminSVG'
import XPBar from '../shared/XPBar'
import HappinessBar from '../shared/HappinessBar'
import CoinDisplay from '../shared/CoinDisplay'
import { ArrowLeft, Edit2, Check } from 'lucide-react'

export default function LuminRewardsScreen({ onNavigate }) {
  const { kid, characters, activeCharacterId, activeCharacter, setActiveCharacter, renameCharacter, buyItem } = useAppState()
  const [tab, setTab] = useState('companion') // 'companion' | 'collection' | 'shop'
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [buyFeedback, setBuyFeedback] = useState(null)

  const char = CHARACTERS[activeCharacterId]
  if (!char || !activeCharacter) return null

  const displayName = activeCharacter.nickname ?? char.evolutionNames[activeCharacter.evolutionStage]

  const handleRename = () => {
    if (editing && nameInput.trim()) renameCharacter(activeCharacterId, nameInput.trim())
    if (!editing) setNameInput(displayName)
    setEditing(e => !e)
  }

  const handleBuy = (itemId) => {
    const success = buyItem(itemId)
    if (success) {
      setBuyFeedback(itemId)
      setTimeout(() => setBuyFeedback(null), 1500)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-500 px-4 pt-10 pb-4 rounded-b-[2rem] shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => onNavigate('home')} className="bg-white/20 rounded-full p-2">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white font-black text-2xl flex-1">Lumins</h1>
          <CoinDisplay coins={kid?.coins ?? 0} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {['companion', 'collection', 'shop'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-full text-sm font-bold capitalize transition-colors ${tab === t ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}>
              {t === 'companion' ? '🐾 Active' : t === 'collection' ? '📚 Collection' : '🛒 Shop'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {tab === 'companion' && (
          <div className="px-4 py-6 space-y-5">
            {/* Big Lumin display */}
            <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col items-center gap-3">
              <div className="relative">
                <LuminSVG characterId={activeCharacterId} stage={activeCharacter.evolutionStage} size={140} animate happiness={activeCharacter.happiness} />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-black px-3 py-1 rounded-full whitespace-nowrap">
                  {char.element}
                </div>
              </div>

              {/* Name + rename */}
              <div className="flex items-center gap-2">
                {editing ? (
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    maxLength={16}
                    className="text-xl font-black text-gray-800 border-b-2 border-purple-400 outline-none text-center bg-transparent"
                  />
                ) : (
                  <h2 className="text-xl font-black text-gray-800">{displayName}</h2>
                )}
                <button onClick={handleRename} className="text-purple-400">
                  {editing ? <Check size={18} className="text-green-500" /> : <Edit2 size={16} />}
                </button>
              </div>

              <div className="w-full space-y-2">
                <XPBar level={activeCharacter.level} xp={activeCharacter.xp} />
                <HappinessBar happiness={activeCharacter.happiness} />
              </div>
            </div>
          </div>
        )}

        {tab === 'collection' && (
          <div className="px-4 py-6">
            <p className="text-sm text-gray-400 font-semibold mb-3">
              {characters.length} / {Object.keys(CHARACTERS).length} Lumins found
            </p>
            <div className="grid grid-cols-3 gap-3">
              {Object.values(CHARACTERS).map(c => {
                const owned = characters.find(ch => ch.id === c.id)
                const isActive = c.id === activeCharacterId
                return (
                  <button
                    key={c.id}
                    onClick={() => owned && setActiveCharacter(c.id)}
                    disabled={!owned}
                    className={`rounded-2xl p-3 flex flex-col items-center gap-1 transition-all ${
                      isActive ? 'bg-purple-100 ring-2 ring-purple-400' :
                      owned ? 'bg-white shadow-sm active:scale-95' : 'bg-gray-100 opacity-40'
                    }`}
                  >
                    {owned
                      ? <LuminSVG characterId={c.id} stage={owned.evolutionStage} size={52} animate={false} happiness={owned.happiness} />
                      : <div className="w-[52px] h-[52px] flex items-center justify-center text-3xl text-gray-300">?</div>
                    }
                    <p className="text-xs font-bold text-gray-700 truncate w-full text-center">
                      {owned ? (owned.nickname ?? c.evolutionNames[owned.evolutionStage]) : '???'}
                    </p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold capitalize ${rarityStyle[c.rarity]}`}>
                      {c.rarity}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'shop' && (
          <div className="px-4 py-6 space-y-4">
            <p className="text-sm text-gray-500">Items boost your Lumin's happiness!</p>
            {['food', 'toy'].map(type => (
              <div key={type}>
                <h3 className="font-black text-gray-700 text-sm uppercase tracking-wide mb-2">
                  {type === 'food' ? '🍎 Food' : '🎮 Toys'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(SHOP_ITEMS).filter(i => i.type === type).map(item => {
                    const canAfford = (kid?.coins ?? 0) >= item.cost
                    const justBought = buyFeedback === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleBuy(item.id)}
                        disabled={!canAfford}
                        className={`bg-white rounded-2xl p-4 text-left shadow-sm transition-all active:scale-95 ${!canAfford ? 'opacity-40' : ''} ${justBought ? 'ring-2 ring-green-400' : ''}`}
                      >
                        <div className="text-3xl mb-1">{item.emoji}</div>
                        <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                        <p className="text-xs text-green-600 font-semibold">+{item.happinessBoost} 😄</p>
                        <div className="flex items-center gap-1 mt-2 text-amber-600 font-bold text-sm">
                          🪙 {item.cost}
                        </div>
                        {justBought && <p className="text-green-500 text-xs font-bold mt-1">Bought! 🎉</p>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const rarityStyle = {
  common: 'bg-gray-100 text-gray-500',
  uncommon: 'bg-green-100 text-green-600',
  rare: 'bg-blue-100 text-blue-600',
  legendary: 'bg-purple-100 text-purple-600',
}
