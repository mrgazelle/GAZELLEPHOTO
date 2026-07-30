'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { PosterUpload } from '@/components/admin/PosterUpload'

const STATUS_OPTIONS = [
  { value: 'scheduled',       label: 'Agendado'     },
  { value: 'ongoing',         label: 'A decorrer'   },
  { value: 'post-production', label: 'Pós-produção' },
  { value: 'completed',       label: 'Concluído'    },
  { value: 'canceled',        label: 'Cancelado'    },
]

export default function EditEventPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [form, setForm] = useState({
    title: '', description: '', date: '', time_start: '', time_end: '',
    location: '', status: 'scheduled', is_public: true,
    category_id: '', price_logged: '', poster_url: '',
  })

  const update = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  async function getToken() {
    const { data: { session } } = await createClient().auth.getSession()
    return session?.access_token ?? ''
  }

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories)

    createClient().from('events').select('*').eq('id', id).single()
      .then(({ data }) => {
        if (data) setForm({
          title:       data.title        ?? '',
          description: data.description  ?? '',
          date:        data.date         ?? '',
          time_start:  data.time_start   ?? '',
          time_end:    data.time_end     ?? '',
          location:    data.location     ?? '',
          status:      data.status       ?? 'scheduled',
          is_public:   data.is_public    ?? true,
          category_id: data.category_id  ?? '',
          price_logged:data.price_logged?.toString() ?? '',
          poster_url:  data.poster_url   ?? '',
        })
        setLoading(false)
      })
  }, [id])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const token = await getToken()
      const res = await fetch(`app/api/events/[eventId]`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          category_id:  form.category_id  || null,
          time_start:   form.time_start   || null,
          time_end:     form.time_end     || null,
          location:     form.location     || null,
          description:  form.description  || null,
          poster_url:   form.poster_url   || null,
          price_logged: form.price_logged ? Number(form.price_logged) : null,
        }),
      })
      if (res.ok) router.push('/admin/events')
      else { const e = await res.json(); alert('Erro: ' + e.error) }
    } finally { setSaving(false) }
  }

  async function onDelete() {
    if (!confirm('Apagar este evento e todas as suas fotos?')) return
    const token = await getToken()
    const res = await fetch(`app/api/events/[eventId]`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) router.push('/admin/events')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="w-6 h-6 border-2 border-gz-blue/30 border-t-gz-blue rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/events"
          className="inline-flex items-center gap-2 text-gz-dim hover:text-gz-blue
                     transition-colors font-display text-xs tracking-widest uppercase mb-6">
          <ArrowLeft size={14} /> Eventos
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-gz-white">Editar Evento</h1>
          <Link href={`/admin/events/${id}/photos`}
            className="gz-btn-ghost flex items-center gap-2 text-sm">
            <ImageIcon size={14} /> Gerir Fotos
          </Link>
        </div>
      </div>

      <form onSubmit={onSubmit} className="gz-card p-8 space-y-6">
        <div className="grid grid-cols-2 gap-4">

          {/* Flyer */}
          <div className="col-span-2">
            <label className="gz-label">Flyer / Cartaz (4×5)</label>
            <PosterUpload value={form.poster_url} onChange={url => update('poster_url', url)} />
          </div>

          {/* Título */}
          <div className="col-span-2">
            <label className="gz-label">Título *</label>
            <input value={form.title} onChange={e => update('title', e.target.value)}
              className="gz-input" placeholder="Nome do evento" required />
          </div>

          {/* Data */}
          <div>
            <label className="gz-label">Data *</label>
            <input type="date" value={form.date} onChange={e => update('date', e.target.value)}
              className="gz-input" required />
          </div>

          {/* Localização */}
          <div>
            <label className="gz-label">Localização</label>
            <input value={form.location} onChange={e => update('location', e.target.value)}
              className="gz-input" placeholder="Cidade ou local" />
          </div>

          {/* Hora início */}
          <div>
            <label className="gz-label">Hora início</label>
            <input type="time" value={form.time_start}
              onChange={e => update('time_start', e.target.value)} className="gz-input" />
          </div>

          {/* Hora fim */}
          <div>
            <label className="gz-label">Hora fim</label>
            <input type="time" value={form.time_end}
              onChange={e => update('time_end', e.target.value)} className="gz-input" />
          </div>

          {/* Categoria */}
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

          {/* Estado */}
          <div>
            <label className="gz-label">Estado</label>
            <select value={form.status} onChange={e => update('status', e.target.value)}
              className="gz-input">
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Valor */}
          <div>
            <label className="gz-label">Valor Cobrado (€)</label>
            <input type="number" value={form.price_logged}
              onChange={e => update('price_logged', e.target.value)}
              className="gz-input" placeholder="Ex: 120" min="0" step="0.01" />
          </div>

          {/* Descrição */}
          <div className="col-span-2">
            <label className="gz-label">Descrição</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)}
              className="gz-input resize-none" rows={3}
              placeholder="Descrição opcional do evento..." />
          </div>

          {/* Público */}
          <div className="col-span-2 flex items-center gap-3">
            <input type="checkbox" id="public" checked={form.is_public}
              onChange={e => update('is_public', e.target.checked)}
              className="w-4 h-4 accent-gz-blue" />
            <label htmlFor="public" className="text-gz-ghost text-sm font-display cursor-pointer">
              Evento público (visível no site)
            </label>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="gz-btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
            <Save size={15} />
            {saving ? 'A guardar...' : 'Guardar Alterações'}
          </button>
          <Link href="/admin/events" className="gz-btn-ghost px-6">Cancelar</Link>
        </div>

        {/* Apagar */}
        <button type="button" onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 border border-red-500/20
                     text-red-400 hover:bg-red-500/10 py-3 rounded-lg font-display text-xs
                     tracking-widest uppercase transition-all duration-200">
          <Trash2 size={13} /> Apagar Evento
        </button>
      </form>
    </div>
  )
}
