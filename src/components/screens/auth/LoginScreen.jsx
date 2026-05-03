import { useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'

export default function LoginScreen() {
  const { signInWithEmail, signUpWithEmail } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signupDone, setSignupDone] = useState(false)

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error: err } = await signUpWithEmail(email, password)
        if (err) throw err
        setSignupDone(true)
      } else {
        const { error: err } = await signInWithEmail(email, password)
        if (err) throw err
      }
    } catch (err) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (signupDone) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-600 to-indigo-700 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-white font-black text-2xl">Check your email!</h1>
        <p className="text-violet-200 mt-2">We sent a confirmation link to <strong>{email}</strong>.</p>
        <p className="text-violet-300 text-sm mt-1">Click the link, then come back and sign in.</p>
        <button
          onClick={() => { setSignupDone(false); setMode('signin') }}
          className="mt-8 text-white/70 font-semibold text-sm"
        >
          ← Back to sign in
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-600 via-purple-500 to-indigo-700 flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-2">✨</div>
        <h1 className="text-4xl font-black text-white drop-shadow-lg">ChoreQuest</h1>
        <p className="text-violet-200 mt-1">Parent account</p>
      </div>

      <div className="w-full max-w-xs">
        {/* Tabs */}
        <div className="flex bg-white/20 rounded-2xl p-1 mb-4">
          {['signin', 'signup'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${mode === m ? 'bg-white text-purple-700' : 'text-white'}`}
            >
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <input
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-white/10 border-2 border-white/20 text-white placeholder-white/50 rounded-2xl px-4 py-3 font-semibold outline-none focus:border-white/60 transition-colors"
          />
          <input
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-white/10 border-2 border-white/20 text-white placeholder-white/50 rounded-2xl px-4 py-3 font-semibold outline-none focus:border-white/60 transition-colors"
          />

          {error && <p className="text-red-300 text-sm font-semibold text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 to-amber-400 text-gray-900 font-black text-lg py-3 rounded-2xl disabled:opacity-50 active:scale-95 transition-transform shadow-lg"
          >
            {loading ? '...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
