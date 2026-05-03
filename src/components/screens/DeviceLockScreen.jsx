import { useAuth } from '../../hooks/useAuth'
import { LogOut, User, Monitor } from 'lucide-react'

export default function DeviceLockScreen() {
  const { kids, setDeviceLock, signOut, user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">📱</div>
        <h1 className="text-white font-black text-2xl">Whose device is this?</h1>
        <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        {kids.map(kid => (
          <button
            key={kid.id}
            onClick={() => setDeviceLock(kid.id)}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-500 text-white rounded-2xl p-4 flex items-center gap-4 shadow-lg active:scale-95 transition-transform"
          >
            <div className="bg-white/20 rounded-full p-2">
              <User size={24} className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-black text-lg">{kid.name}'s device</p>
              <p className="text-purple-200 text-xs">Lock to kid view</p>
            </div>
          </button>
        ))}

        <button
          onClick={() => setDeviceLock('parent')}
          className="w-full bg-white/10 text-white rounded-2xl p-4 flex items-center gap-4 border border-white/20 active:scale-95 transition-transform"
        >
          <div className="bg-white/20 rounded-full p-2">
            <Monitor size={24} className="text-white" />
          </div>
          <div className="text-left">
            <p className="font-black text-lg">Parent's device</p>
            <p className="text-gray-400 text-xs">Full control, no kid lock</p>
          </div>
        </button>
      </div>

      <button onClick={signOut} className="mt-10 flex items-center gap-1 text-white/30 text-xs font-semibold">
        <LogOut size={12} /> Sign out
      </button>
    </div>
  )
}
