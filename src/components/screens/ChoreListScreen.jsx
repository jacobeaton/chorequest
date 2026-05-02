import { useAppState } from '../../hooks/useAppState'
import ChoreCard from '../shared/ChoreCard'
import { ArrowLeft, Plus } from 'lucide-react'

const FILTERS = ['all', 'easy', 'medium', 'hard']

export default function ChoreListScreen({ onNavigate, filter: filterProp = 'all' }) {
  const { chores } = useAppState()
  const [filter, setFilter] = [filterProp, () => {}]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-violet-600 to-purple-500 px-4 pt-10 pb-5 rounded-b-[2rem] shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => onNavigate('home')} className="bg-white/20 rounded-full p-2">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white font-black text-2xl flex-1">All Chores</h1>
          <button onClick={() => onNavigate('add')} className="bg-white rounded-full p-2 shadow">
            <Plus size={20} className="text-purple-600" />
          </button>
        </div>
        <FilterBar active={filterProp} onSelect={(f) => onNavigate('chores', { filter: f })} />
      </div>

      <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto pb-8">
        {chores
          .filter(c => filterProp === 'all' || c.difficulty === filterProp)
          .map(chore => (
            <ChoreCard
              key={chore.id}
              chore={chore}
              onStart={() => onNavigate('active', { chore })}
            />
          ))}
        {chores.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">📋</p>
            <p className="font-bold">No chores yet!</p>
            <button onClick={() => onNavigate('add')} className="mt-3 text-purple-500 font-bold text-sm">
              + Add your first chore
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const FilterBar = ({ active, onSelect }) => (
  <div className="flex gap-2">
    {FILTERS.map(f => (
      <button
        key={f}
        onClick={() => onSelect(f)}
        className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${
          active === f ? 'bg-white text-purple-600' : 'bg-white/20 text-white'
        }`}
      >
        {f === 'all' ? 'All' : f}
      </button>
    ))}
  </div>
)
