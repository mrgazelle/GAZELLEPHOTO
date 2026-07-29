'use client'
import { useState } from 'react'
import { Bell, Check } from 'lucide-react'

export function SubscribeButton({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function subscribe() {
    if (!email) return
    setLoading(true)
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, event_id: eventId }),
      })
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 text-gz-blue font-display text-xs tracking-widest uppercase">
        <Check size={14} /> Subscrito! Vais ser notificado.
      </div>
    )
  }

  return (
    <div>
      {!open
        ? (
          <button
            onClick={() => setOpen(true)}
            className="gz-btn-ghost flex items-center gap-2 text-sm"
          >
            <Bell size={14} /> Notificar quando disponível
          </button>
        )
        : (
          <div className="flex gap-2 items-center">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="teu@email.com"
              className="gz-input w-48 text-sm py-2"
              onKeyDown={e => e.key === 'Enter' && subscribe()}
              autoFocus
            />
            <button
              onClick={subscribe}
              disabled={loading || !email}
              className="gz-btn-primary py-2 text-sm disabled:opacity-50"
            >
              {loading ? '...' : 'OK'}
            </button>
          </div>
        )
      }
    </div>
  )
}
