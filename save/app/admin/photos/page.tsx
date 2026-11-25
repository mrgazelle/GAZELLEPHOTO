'use client'
import { useState, useEffect, useRef } from 'react'
import { Upload, Heart, ImageIcon, Trash2, X, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Photo {
  id: string; url: string; thumbnail_url: string
  is_portfolio: boolean; event_id?: string
  category_id?: string
  events?: { title: string }
  categories?: { name: string; slug: string }
}

interface Category { id: string; name: string; slug: string }

export default function AdminPhotosPage() {
  const [photos, setPhotos]         = useState<Photo[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState<'all' | 'portfolio'>('portfolio')
  const [uploading, setUploading]   = useState(false)
  const [progress, setProgress]     = useState({ done: 0, total: 0 })

  // Modal de categoria
  const [showModal, setShowModal]         = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const inputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()

  async function getToken() {
    const { data: { session } } = await createClient().auth.getSession()
    return session?.access_token ?? ''
  }

  async function loadPhotos(silent = false) {
    if (!silent) setLoading(true)
    const token = await getToken()
    const url = filter === 'portfolio' ? '/api/photos/list?portfolio=true' : '/api/photos/list'
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    const data = await res.json()
    setPhotos(Array.isArray(data) ? data : [])
    if (!silent) setLoading(false)
  }

  useEffect(() => { loadPhotos() }, [filter])

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories)
  }, [])

  // Abre o modal primeiro, depois o file picker
  function openUploadFlow() {
    setSelectedCategory('')
    setShowModal(true)
  }

  function confirmCategory() {
    setShowModal(false)
    inputRef.current?.click()
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    setProgress({ done: 0, total: files.length })
    const token = await getToken()

    for (let i = 0; i < files.length; i++) {
      const fd = new FormData()
      fd.append('files', files[i])
      fd.append('event_slug', 'portfolio')
      fd.append('is_portfolio', 'true')
      if (selectedCategory) fd.append('category_id', selectedCategory)

      await fetch('/api/photos/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      setProgress({ done: i + 1, total: files.length })
    }

    await loadPhotos()
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function togglePortfolio(photo: Photo) {
    const action = photo.is_portfolio ? 'Remover do portfolio?' : 'Adicionar ao portfolio?'
    if (!confirm(action)) return


    const token = await getToken()
    setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, is_portfolio: !p.is_portfolio } : p))
    const res = await fetch(`/api/photos/${photo.id}/portfolio`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ is_portfolio: !photo.is_portfolio }),
    })

    if (res.ok) {
      const updated = await res.json()
      setPhotos(prev => prev.map(p =>
        p.id === photo.id ? { ...p, is_portfolio: updated.is_portfolio } : p
      ))
      router.refresh()
    } else {
      const err = await res.json().catch(() => ({}))
      alert('Erro: ' + JSON.stringify(err))
    }
  }

  async function deletePhoto(id: string) {
    if (!confirm('Apagar esta foto permanentemente? Esta ação não pode ser desfeita.')) return
    const token = await getToken()
    const res = await fetch(`/api/photos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) setPhotos(prev => prev.filter(p => p.id !== id))
  }

  const pct = progress.total > 0 ? Math.round(progress.done / progress.total * 100) : 0

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gz-white mb-1">Fotos</h1>
          <p className="text-gz-dim text-sm">{photos.length} fotos</p>
        </div>
        <button
          onClick={openUploadFlow}
          disabled={uploading}
          className="gz-btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <Upload size={14} />
          {uploading ? `${progress.done}/${progress.total}...` : 'Upload para Portfolio'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={handleUpload} />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'portfolio', label: '❤️ Portfolio' },
          { value: 'all',       label: 'Todas as fotos' },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value as any)}
            className={`font-display text-xs tracking-widest uppercase px-4 py-2 rounded-full
                       border transition-all duration-200
                       ${filter === f.value
                         ? 'bg-gz-blue text-gz-black border-gz-blue'
                         : 'text-gz-ghost border-gz-border hover:border-gz-blue/40'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Progress */}
      {uploading && (
        <div className="mb-6">
          <div className="flex justify-between text-xs font-display text-gz-dim mb-2">
            <span>A carregar {progress.done} de {progress.total}...</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-gz-elevated rounded-full overflow-hidden">
            <div className="h-full bg-gz-blue rounded-full transition-all"
              style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <span className="w-6 h-6 border-2 border-gz-blue/30 border-t-gz-blue rounded-full animate-spin" />
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {photos.map(photo => (
            <div key={photo.id}
              className="relative aspect-square rounded-lg overflow-hidden gz-card group cursor-pointer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.thumbnail_url} alt=""
                className="w-full h-full object-cover" loading="lazy" />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100
                              transition-opacity flex items-center justify-center gap-3">
                <button onClick={() => togglePortfolio(photo)}
                  title={photo.is_portfolio ? 'Remover do portfolio' : 'Adicionar ao portfolio'}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border
                             transition-all duration-200
                             ${photo.is_portfolio
                               ? 'bg-red-500/30 border-red-400 text-red-400'
                               : 'bg-gz-black/60 border-gz-border text-gz-ghost hover:border-red-400 hover:text-red-400'}`}>
                  <Heart size={14} className={photo.is_portfolio ? 'fill-red-400' : ''} />
                </button>
                <button onClick={() => deletePhoto(photo.id)}
                  title="Apagar foto"
                  className="w-9 h-9 rounded-full bg-gz-black/60 border border-gz-border
                             text-gz-ghost hover:border-red-500 hover:text-red-400
                             flex items-center justify-center transition-all duration-200">
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Badge portfolio */}
              {photo.is_portfolio && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500/80 rounded-full
                                flex items-center justify-center pointer-events-none">
                  <Heart size={10} className="fill-white text-white" />
                </div>
              )}

              {/* Categoria ou evento */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 p-2
                              opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="font-display text-xs text-gz-ghost truncate">
                  {photo.categories?.name ?? photo.events?.title ?? '—'}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="text-center py-24 text-gz-dim border-2 border-dashed border-gz-border
                     rounded-xl cursor-pointer hover:border-gz-blue/30 transition-colors"
          onClick={openUploadFlow}
        >
          <ImageIcon size={32} className="mx-auto mb-3" />
          <p className="font-display text-sm tracking-widest uppercase">
            {filter === 'portfolio' ? 'Nenhuma foto no portfolio ainda' : 'Sem fotos'}
          </p>
          <p className="text-xs text-gz-border mt-2">
            {filter === 'portfolio'
              ? 'Marca fotos com ❤️ nos eventos ou faz upload direto aqui'
              : 'Adiciona fotos através dos eventos'
            }
          </p>
        </div>
      )}

      {/* ── Modal de categoria ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="gz-card p-8 w-full max-w-sm mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-bold text-gz-white">
                Selecionar Categoria
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full border border-gz-border flex items-center
                           justify-center text-gz-ghost hover:text-gz-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-gz-dim text-sm mb-5 font-light">
              Opcional — permite filtrar no portfolio público.
            </p>

            <div className="space-y-2 mb-6">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all font-display
                           text-xs tracking-widest uppercase
                           ${selectedCategory === ''
                             ? 'border-gz-blue bg-gz-blue/10 text-gz-blue'
                             : 'border-gz-border text-gz-ghost hover:border-gz-blue/40'}`}
              >
                Sem categoria
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all font-display
                             text-xs tracking-widest uppercase
                             ${selectedCategory === c.id
                               ? 'border-gz-blue bg-gz-blue/10 text-gz-blue'
                               : 'border-gz-border text-gz-ghost hover:border-gz-blue/40'}`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <button
              onClick={confirmCategory}
              className="gz-btn-primary w-full flex items-center justify-center gap-2"
            >
              Continuar — Selecionar Fotos <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}