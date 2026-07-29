'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, Trash2, ImageIcon, CheckCircle, Bell, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface Photo { id: string; url: string; thumbnail_url: string; taken_at?: string }
interface Event { id: string; title: string; slug: string; status: string }

const STATUS_OPTIONS = [
  { value: 'scheduled',        label: 'Agendado'      },
  { value: 'ongoing',          label: 'A decorrer'    },
  { value: 'post-production',  label: 'Pós-produção'  },
  { value: 'completed',        label: 'Concluído'     },
  { value: 'canceled',         label: 'Cancelado'     },
]

export default function EventPhotosPage() {
  const { id } = useParams<{ id: string }>()
  const inputRef = useRef<HTMLInputElement>(null)

  const [event, setEvent]     = useState<Event | null>(null)
  const [photos, setPhotos]   = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState({ done: 0, total: 0 })
  const [selected, setSelected]   = useState<Set<string>>(new Set())
  const [deleting, setDeleting]   = useState(false)
  const [status, setStatus]       = useState('scheduled')
  const [savingStatus, setSavingStatus] = useState(false)
  const [statusSaved, setStatusSaved]   = useState(false)
  const [notifying, setNotifying] = useState(false)
  const [notified, setNotified]   = useState(false)

  async function getToken() {
    const { data: { session } } = await createClient().auth.getSession()
    return session?.access_token ?? ''
  }

  async function loadPhotos() {
    const { data } = await createClient()
      .from('photos').select('*').eq('event_id', id)
      .order('taken_at', { ascending: true })
    setPhotos(data ?? [])
  }

  useEffect(() => {
    createClient().from('events').select('id,title,slug,status').eq('id', id).single()
      .then(({ data }) => { if (data) { setEvent(data); setStatus(data.status) } })
    loadPhotos()
  }, [id])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length || !event) return

    setUploading(true)
    setProgress({ done: 0, total: files.length })
    const token = await getToken()

    for (let i = 0; i < files.length; i++) {
      const fd = new FormData()
      fd.append('files', files[i])
      fd.append('event_id', id)
      fd.append('event_slug', event.slug)
      try {
        await fetch('/api/photos', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })
      } catch (err) {
        console.error('Upload error:', err)
      }
      setProgress({ done: i + 1, total: files.length })
    }

    await loadPhotos()
    setUploading(false)
    setProgress({ done: 0, total: 0 })
    // Reset input para permitir selecionar os mesmos ficheiros outra vez
    if (inputRef.current) inputRef.current.value = ''
  }

  async function saveStatus() {
  setSavingStatus(true)
  const token = await getToken()
  const res = await fetch(`/api/events/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  })
  if (res.ok) {
    setEvent(prev => prev ? { ...prev, status } : prev)
    setStatusSaved(true)
    setTimeout(() => setStatusSaved(false), 2500)
  }
  setSavingStatus(false)
}

  async function notifySubscribers() {
    setNotifying(true)
    const token = await getToken()
    await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ event_id: id }),
    })
    setNotified(true)
    setNotifying(false)
  }

  async function deleteSelected() {
    if (!selected.size || !confirm(`Apagar ${selected.size} foto(s)?`)) return
    setDeleting(true)
    const sb = createClient()
    for (const pid of selected) await sb.from('photos').delete().eq('id', pid)
    setSelected(new Set())
    await loadPhotos()
    setDeleting(false)
  }

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/events"
          className="inline-flex items-center gap-2 text-gz-dim hover:text-gz-blue
                     transition-colors font-display text-xs tracking-widest uppercase mb-6">
          <ArrowLeft size={14} /> Eventos
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-gz-white mb-1">
              {event?.title ?? '...'}
            </h1>
            <p className="text-gz-dim text-sm">{photos.length} fotos</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => inputRef.current?.click()} disabled={uploading}
              className="gz-btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
              <Upload size={14} />
              {uploading ? `${progress.done}/${progress.total}...` : 'Adicionar Fotos'}
            </button>
            <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={handleUpload} />

            {status === 'completed' && !notified && (
              <button onClick={notifySubscribers} disabled={notifying}
                className="gz-btn-ghost flex items-center gap-2 text-sm border-gz-blue/30
                           text-gz-blue hover:bg-gz-blue/10 disabled:opacity-50">
                <Bell size={14} />
                {notifying ? 'A notificar...' : 'Notificar Subscritores'}
              </button>
            )}
            {notified && (
              <span className="flex items-center gap-2 text-gz-blue font-display text-xs
                               tracking-widest uppercase px-3 border border-gz-blue/20 rounded-lg">
                <CheckCircle size={14} /> Notificações enviadas
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Estado */}
      <div className="gz-card p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="gz-label mb-2">Estado do Evento</p>
          <select value={status} onChange={e => { setStatus(e.target.value); setStatusSaved(false) }}
            className="gz-input max-w-xs">
            {STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          {status !== event?.status && (
            <p className="text-amber-400 text-xs font-display tracking-widest uppercase">
              Não guardado
            </p>
          )}
          <button onClick={saveStatus}
            disabled={savingStatus || (status === event?.status && !statusSaved)}
            className="gz-btn-primary flex items-center gap-2 text-sm disabled:opacity-40">
            {statusSaved
              ? <><CheckCircle size={14} /> Guardado!</>
              : savingStatus ? 'A guardar...'
              : <><Save size={14} /> Guardar</>
            }
          </button>
        </div>
      </div>

      {/* Barra seleção */}
      {photos.length > 0 && (
        <div className="flex items-center gap-4 mb-5 pb-4 border-b border-gz-border">
          <button onClick={() => setSelected(new Set(photos.map(p => p.id)))}
            className="font-display text-xs tracking-widest uppercase text-gz-dim hover:text-gz-white transition-colors">
            Selecionar todas ({photos.length})
          </button>
          {selected.size > 0 && (
            <>
              <span className="text-gz-dim text-xs">{selected.size} selecionadas</span>
              <button onClick={() => setSelected(new Set())}
                className="font-display text-xs tracking-widest uppercase text-gz-dim hover:text-gz-white transition-colors">
                Limpar
              </button>
              <button onClick={deleteSelected} disabled={deleting}
                className="flex items-center gap-1.5 font-display text-xs tracking-widest uppercase
                           text-red-400 hover:text-red-300 disabled:opacity-50 ml-auto">
                <Trash2 size={13} />
                {deleting ? 'A apagar...' : `Apagar ${selected.size}`}
              </button>
            </>
          )}
        </div>
      )}

      {/* Progress bar */}
      {uploading && (
        <div className="mb-6">
          <div className="flex justify-between text-xs font-display text-gz-dim mb-2">
            <span>A carregar {progress.done} de {progress.total} fotos...</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-gz-elevated rounded-full overflow-hidden">
            <div className="h-full bg-gz-blue rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {photos.map(photo => (
            <div key={photo.id} onClick={() => {
              setSelected(prev => {
                const next = new Set(prev)
                next.has(photo.id) ? next.delete(photo.id) : next.add(photo.id)
                return next
              })
            }}
              className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer
                         border-2 transition-all duration-150
                         ${selected.has(photo.id)
                           ? 'border-gz-blue scale-95'
                           : 'border-transparent hover:border-gz-border'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.thumbnail_url} alt="" className="w-full h-full object-cover" loading="lazy" />
              {selected.has(photo.id) && (
                <div className="absolute inset-0 bg-gz-blue/25 flex items-center justify-center">
                  <div className="w-6 h-6 bg-gz-blue rounded-full flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              )}
              {photo.taken_at && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 p-1 opacity-0 hover:opacity-100 transition-opacity">
                  <span className="font-display text-xs text-gz-ghost">
                    {new Date(photo.taken_at).toLocaleTimeString('pt', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !uploading && (
        <div onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gz-border rounded-xl py-24
                     flex flex-col items-center justify-center gap-4 text-gz-dim
                     cursor-pointer hover:border-gz-blue/30 hover:text-gz-blue transition-all">
          <ImageIcon size={32} />
          <p className="font-display text-sm tracking-widest uppercase">Clica para adicionar fotos</p>
          <p className="text-xs text-gz-border">JPG, PNG, WEBP · Sem limite</p>
        </div>
      )}
    </div>
  )
}
