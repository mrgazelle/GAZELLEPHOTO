'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou password incorretos.')
      setLoading(false)
    } else {
      window.location.href = '/admin'
    }
  }

  return (
    <div className="min-h-screen bg-gz-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-2 h-2 bg-gz-blue rounded-full animate-pulse-slow" />
            <span className="font-display text-sm font-bold tracking-[0.2em] uppercase">
              Gazelle Photo
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-gz-white">Admin Login</h1>
        </div>

        <form onSubmit={login} className="gz-card p-8 space-y-5">
          <div>
            <label className="gz-label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="gz-input" placeholder="teu@email.com" required />
          </div>
          <div>
            <label className="gz-label">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="gz-input" placeholder="••••••••" required />
          </div>
          {error && <p className="text-red-400 text-sm font-display">{error}</p>}
          <button type="submit" disabled={loading}
            className="gz-btn-primary w-full disabled:opacity-50">
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
