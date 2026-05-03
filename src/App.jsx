import { useState } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { AppProvider, useAppState } from './hooks/useAppState'
import LoginScreen from './components/screens/auth/LoginScreen'
import FamilySetupScreen from './components/screens/auth/FamilySetupScreen'
import DeviceLockScreen from './components/screens/DeviceLockScreen'
import ParentDashboard from './components/screens/ParentDashboard'
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

function SplashScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-600 to-indigo-700 flex flex-col items-center justify-center">
      <div className="text-5xl mb-3 animate-bounce">✨</div>
      <h1 className="text-white font-black text-3xl">ChoreQuest</h1>
    </div>
  )
}

function Router() {
  const { characters } = useAppState()
  const { deviceKidId } = useAuth()
  const [view, setView] = useState('home')
  const [params, setParams] = useState({})
  const [dashRefreshKey, setDashRefreshKey] = useState(0)

  const navigate = (screen, p = {}) => {
    // Re-mount parent dashboard when returning from a sub-screen so it reloads data
    if (deviceKidId === 'parent' && view !== screen) {
      setDashRefreshKey(k => k + 1)
    }
    setView(screen)
    setParams(p)
  }

  // Parent device: dashboard, but allow sub-screens like Add Chore
  if (deviceKidId === 'parent') {
    const parentScreen = view === 'add'
      ? <AddChoreScreen onNavigate={navigate} createdBy={params.createdBy ?? 'parent'} existingChore={params.existingChore ?? null} />
      : <ParentDashboard key={dashRefreshKey} onNavigate={navigate} />
    return (
      <div className="max-w-md mx-auto min-h-screen relative overflow-hidden font-display">
        {parentScreen}
      </div>
    )
  }

  // Fallback: kid has no characters yet
  if (characters.length === 0) {
    return <CharacterSelectScreen />
  }

  const screen = {
    home: <HomeScreen onNavigate={navigate} />,
    chores: <ChoreListScreen onNavigate={navigate} filter={params.filter ?? 'all'} />,
    active: params.chore ? <ActiveChoreScreen chore={params.chore} onNavigate={navigate} /> : <HomeScreen onNavigate={navigate} />,
    complete: <ChoreCompleteScreen chore={params.chore} result={params.result} onNavigate={navigate} />,
    add: <AddChoreScreen onNavigate={navigate} createdBy={params.createdBy ?? 'kid'} existingChore={params.existingChore ?? null} />,
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

function AuthGate() {
  const { authLoading, session, kids, deviceKidId } = useAuth()

  if (authLoading) return <SplashScreen />
  if (!session) return <LoginScreen />
  if (!kids || kids.length === 0) return <FamilySetupScreen />
  if (!deviceKidId) return <DeviceLockScreen />

  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}
