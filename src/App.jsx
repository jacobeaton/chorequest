import { useState } from 'react'
import { AppProvider, useAppState } from './hooks/useAppState'
import CharacterSelectScreen from './components/screens/CharacterSelectScreen'
import HomeScreen from './components/screens/HomeScreen'
import ChoreListScreen from './components/screens/ChoreListScreen'
import ActiveChoreScreen from './components/screens/ActiveChoreScreen'
import ChoreCompleteScreen from './components/screens/ChoreCompleteScreen'
import AddChoreScreen from './components/screens/AddChoreScreen'
import LuminRewardsScreen from './components/screens/LuminRewardsScreen'
import ParentModeScreen from './components/screens/ParentModeScreen'
import EvolutionRevealScreen from './components/screens/EvolutionRevealScreen'
import PhotoSubmitScreen from './components/screens/PhotoSubmitScreen'
import PullRevealScreen from './components/screens/PullRevealScreen'

function Router() {
  const { settings, characters } = useAppState()
  const [view, setView] = useState('home')
  const [params, setParams] = useState({})

  const navigate = (screen, p = {}) => {
    setView(screen)
    setParams(p)
  }

  if (settings.isFirstRun || characters.length === 0) {
    return <CharacterSelectScreen />
  }

  const screen = {
    home: <HomeScreen onNavigate={navigate} />,
    chores: <ChoreListScreen onNavigate={navigate} filter={params.filter ?? 'all'} />,
    active: params.chore ? <ActiveChoreScreen chore={params.chore} onNavigate={navigate} /> : <HomeScreen onNavigate={navigate} />,
    complete: <ChoreCompleteScreen chore={params.chore} result={params.result} onNavigate={navigate} />,
    add: <AddChoreScreen onNavigate={navigate} createdBy={params.createdBy ?? 'kid'} />,
    lumin: <LuminRewardsScreen onNavigate={navigate} />,
    parent: <ParentModeScreen onNavigate={navigate} />,
    evolve: <EvolutionRevealScreen characterId={params.characterId} newStage={params.newStage} newLevel={params.newLevel} onNavigate={navigate} />,
    photo: <PhotoSubmitScreen onNavigate={navigate} />,
    pull: <PullRevealScreen characterId={params.characterId} onNavigate={navigate} />,
  }[view] ?? <HomeScreen onNavigate={navigate} />

  return (
    <div className="max-w-md mx-auto min-h-screen relative overflow-hidden font-display">
      {screen}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}
