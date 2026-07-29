'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { PosterUpload } from '@/components/admin/PosterUpload'

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', date: '', time_start: '', time_end: '',
    location: '', status: 'scheduled', is_public: true,
    category_id: '', price_logged: '', poster_url: '',  // ← adiciona isto
  })
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(setCategories)
      .catch(() => { })
  }, [])

  function update(key: string, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          ...form,
          category_id: form.category_id || null,   // ← "" vira null
          time_start: form.time_start || null,
          time_end: form.time_end || null,
          location: form.location || null,
          description: form.description || null,
          price_logged: form.price_logged ? Number(form.price_logged) : null,
        }),
      })

      if (res.ok) {
        router.push('/admin/events')
      } else {
        const err = await res.json()
        console.error('Erro:', err)
        alert('Erro: ' + err.error)
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/events"
          className="inline-flex items-center gap-2 text-gz-dim hover:text-gz-blue
                     transition-colors font-display text-xs tracking-widest uppercase mb-6">
          <ArrowLeft size={14} /> Eventos
        </Link>
        <h1 className="font-display text-3xl font-bold text-gz-white">Novo Evento</h1>
      </div>

      <form onSubmit={onSubmit} className="gz-card p-8 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="gz-label">Flyer / Cartaz do Evento</label>
            <PosterUpload
              value={form.poster_url}
              onChange={(url) => update('poster_url', url)}
            />
          </div>
          <div className="col-span-2">
            <label className="gz-label">Título *</label>
            <input value={form.title} onChange={e => update('title', e.target.value)}
              className="gz-input" placeholder="Nome do evento" required />
          </div>
          <div>
            <label className="gz-label">Data *</label>
            <input type="date" value={form.date} onChange={e => update('date', e.target.value)}
              className="gz-input" required />
          </div>
          <div>
            <label className="gz-label">Localização</label>
            <input value={form.location} onChange={e => update('location', e.target.value)}
              className="gz-input" placeholder="Cidade ou local" />
          </div>
          <div>
            <label className="gz-label">Hora início</label>
            <input type="time" value={form.time_start} onChange={e => update('time_start', e.target.value)}
              className="gz-input" />
          </div>
          <div>
            <label className="gz-label">Hora fim</label>
            <input type="time" value={form.time_end} onChange={e => update('time_end', e.target.value)}
              className="gz-input" />
          </div>
          <div>
            <label className="gz-label">Categoria</label>
            <select value={form.category_id} onChange={e => update('category_id', e.target.value)}
              className="gz-input">
              <option value="">Sem categoria</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="gz-label">Estado</label>
            <select value={form.status} onChange={e => update('status', e.target.value)} className="gz-input">
              <option value="scheduled">Agendado</option>
              <option value="ongoing">A decorrer</option>
              <option value="post-production">Pós-produção</option>
              <option value="completed">Concluído</option>
              <option value="canceled">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="gz-label">Valor Cobrado (€)</label>
            <input type="number" value={form.price_logged} onChange={e => update('price_logged', e.target.value)}
              className="gz-input" placeholder="Ex: 120" min="0" step="0.01" />
          </div>
          <div className="col-span-2">
            <label className="gz-label">Descrição</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)}
              className="gz-input resize-none" rows={3} placeholder="Descrição opcional..." />
          </div>
          <div className="col-span-2 flex items-center gap-3">
            <input type="checkbox" id="public" checked={form.is_public}
              onChange={e => update('is_public', e.target.checked)}
              className="w-4 h-4 accent-gz-blue" />
            <label htmlFor="public" className="text-gz-ghost text-sm font-display cursor-pointer">
              Evento público (visível no site)
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="gz-btn-primary flex-1 disabled:opacity-50">
            {loading ? 'A criar...' : 'Criar Evento'}
          </button>
          <Link href="/admin/events" className="gz-btn-ghost px-6">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
