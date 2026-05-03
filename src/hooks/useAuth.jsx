import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import * as db from '../lib/db'
import { localToday } from '../utils/dateUtils'

const DEVICE_KID_KEY = 'cq_device_kid_id'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [kids, setKids] = useState([])
  const [parentSettings, setParentSettings] = useState({ pin: '1234', soundOn: true })
  const [deviceKidId, setDeviceKidIdState] = useState(() => localStorage.getItem(DEVICE_KID_KEY))

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s) loadParentData(s.user.id)
      else setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s) {
        loadParentData(s.user.id)
      } else {
        setKids([])
        setAuthLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadParentData = async (parentId) => {
    try {
      const [kidsData, settings] = await Promise.all([
        db.getKids(),
        db.getParentSettings(parentId),
      ])
      setKids(kidsData)
      if (settings) {
        setParentSettings(settings)
      } else {
        await db.upsertParentSettings(parentId, { pin: '1234', soundOn: true })
      }
    } catch (err) {
      console.error('loadParentData error:', err)
    } finally {
      setAuthLoading(false)
    }
  }

  const refreshKids = useCallback(async () => {
    const kidsData = await db.getKids()
    setKids(kidsData)
  }, [])

  const signInWithGoogle = useCallback(() => db.signInWithGoogle(), [])

  const signInWithEmail = useCallback((email, password) =>
    db.signInWithEmail(email, password), [])

  const signUpWithEmail = useCallback((email, password) =>
    db.signUpWithEmail(email, password), [])

  const signOut = useCallback(async () => {
    await db.signOut()
    localStorage.removeItem(DEVICE_KID_KEY)
    setDeviceKidIdState(null)
    setKids([])
    setSession(null)
  }, [])

  const createKid = useCallback(async (name, starterId) => {
    if (!session) return null
    const kid = await db.createKid(session.user.id, name)
    await db.upsertKidCharacter(kid.id, {
      id: starterId,
      level: 1,
      xp: 0,
      evolutionStage: 0,
      happiness: 80,
      lastInteractionDate: localToday(),
      nickname: null,
    })
    await db.updateKid(kid.id, { activeCharacterId: starterId })
    // Only seed default chores if this is the first kid (no chores exist yet)
    const existingChores = await db.getChores()
    if (existingChores.length === 0) {
      await db.seedDefaultChores(session.user.id)
    }
    const updatedKid = { ...kid, activeCharacterId: starterId }
    setKids(prev => [...prev, updatedKid])
    return updatedKid
  }, [session])

  const setDeviceLock = useCallback((kidId) => {
    localStorage.setItem(DEVICE_KID_KEY, kidId)
    setDeviceKidIdState(kidId)
  }, [])

  const clearDeviceLock = useCallback(() => {
    localStorage.removeItem(DEVICE_KID_KEY)
    setDeviceKidIdState(null)
  }, [])

  const updateParentSettings = useCallback(async (updates) => {
    if (!session) return
    setParentSettings(prev => ({ ...prev, ...updates }))
    await db.upsertParentSettings(session.user.id, updates)
  }, [session])

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      authLoading,
      kids,
      parentSettings,
      deviceKidId,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      createKid,
      refreshKids,
      setDeviceLock,
      clearDeviceLock,
      updateParentSettings,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
