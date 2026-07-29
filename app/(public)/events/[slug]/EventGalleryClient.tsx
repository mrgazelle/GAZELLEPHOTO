'use client'
import Image from 'next/image'
import { useState, useMemo, useEffect } from 'react'
import { Download, Heart, X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Photo, Event } from '@/types'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase'

interface Props {
  photos: Photo[]
  event: Event
  isAdmin?: boolean
}

export function EventGalleryClient({ photos: initialPhotos, event, isAdmin = false }: Props) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [selected, setSelected] = useState<Photo | null>(null)
  const [timeFilter, setTimeFilter] = useState<string | null>(null)

  // ── Timeline buckets ──────────────────────────────────────────
  const timeline = useMemo(() => {
    const buckets: Record<string, Photo[]> = {}
    photos.forEach(p => {
      if (!p.taken_at) return
      const h = new Date(p.taken_at).getHours().toString().padStart(2, '0')
      const bucket = `${h}:00`
      if (!buckets[bucket]) buckets[bucket] = []
      buckets[bucket].push(p)
    })
    return Object.entries(buckets).sort(([a], [b]) => a.localeCompare(b))
  }, [photos])

  const displayed = useMemo(() =>
    timeFilter
      ? photos.filter(p => {
          if (!p.taken_at) return false
          const h = new Date(p.taken_at).getHours().toString().padStart(2, '0')
          return `${h}:00` === timeFilter
        })
      : photos
  , [photos, timeFilter])

  useEffect(() => {
    if (!selected) return
    const idx = displayed.findIndex(p => p.id === selected.id)
    if (displayed[idx + 1]) {
      const img = new window.Image()
      img.src = displayed[idx + 1].url
    }
    if (displayed[idx - 1]) {
      const img = new window.Image()
      img.src = displayed[idx - 1].url
    }
  }, [selected, displayed])

  // ── Portfolio toggle (admin only) ─────────────────────────────
  async function togglePortfolio(e: React.MouseEvent, photo: Photo) {
    e.stopPropagation()
    if (!isAdmin) return

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const newValue = !(photo as any).is_portfolio

    await fetch(`/api/photos/${photo.id}/portfolio`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ is_portfolio: newValue }),
    })

    // Atualiza estado local imediatamente
    setPhotos(prev => prev.map(p =>
      p.id === photo.id ? { ...p, is_portfolio: newValue } as any : p
    ))

    // Atualiza também se estiver no lightbox
    if (selected?.id === photo.id) {
      setSelected(prev => prev ? { ...prev, is_portfolio: newValue } as any : prev)
    }
  }

  
  // ── Lightbox navigation ───────────────────────────────────────
  const navLightbox = (dir: 1 | -1) => {
    if (!selected) return
    const idx = displayed.findIndex(p => p.id === selected.id)
    const next = displayed[idx + dir]
    if (next) setSelected(next)
  }

  return (
    <div className="flex gap-6">

      {/* ── Timeline sidebar ── */}
      {timeline.length > 1 && (
        <aside className="hidden lg:flex flex-col w-28 flex-shrink-0">
          <p className="font-display text-xs tracking-widest uppercase text-gz-dim mb-4">
            Timeline
          </p>
          <div className="relative border-l border-gz-border pl-4 flex flex-col gap-3">
            <button
              onClick={() => setTimeFilter(null)}
              className={`font-display text-xs tracking-wider text-left transition-colors
                ${timeFilter === null ? 'text-gz-blue' : 'text-gz-ghost hover:text-gz-white'}`}
            >
              Todas
            </button>
            {timeline.map(([slot, slotPhotos]) => (
              <button
                key={slot}
                onClick={() => setTimeFilter(slot === timeFilter ? null : slot)}
                className={`text-left transition-all duration-200
                  ${timeFilter === slot ? 'text-gz-blue' : 'text-gz-ghost hover:text-gz-white'}`}
              >
                <p className="font-display text-xs tracking-wider">{slot}</p>
                <p className="text-gz-border text-xs mt-0.5">{slotPhotos.length}f</p>
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* ── Grid ── */}
      <div className="flex-1">
        <div className="photo-grid">
          {displayed.map((photo) => (
            <div
              key={photo.id}
              className="photo-grid-item group relative overflow-hidden rounded-lg gz-card-hover cursor-pointer"
              onClick={() => setSelected(photo)}
            >
              <div
                className="relative overflow-hidden"
                style={{ aspectRatio: `${photo.width ?? 3}/${photo.height ?? 4}` }}
              >
                <Image
                  src={photo.thumbnail_url}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                {/* ── Coração ── */}
                {isAdmin ? (
                  // Admin: clicável, marca/desmarca portfolio
                  <button
                    onClick={(e) => togglePortfolio(e, photo)}
                    title={(photo as any).is_portfolio ? 'Remover do portfolio' : 'Adicionar ao portfolio'}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gz-black/70
                               backdrop-blur-sm flex items-center justify-center
                               opacity-0 group-hover:opacity-100 transition-all duration-200
                               hover:scale-110 border border-gz-border hover:border-red-400/50"
                  >
                    <Heart
                      size={14}
                      className={(photo as any).is_portfolio
                        ? 'text-red-400 fill-red-400'
                        : 'text-gz-white hover:text-red-300'
                      }
                    />
                  </button>
                ) : (
                  // Visitante: só vê se está no portfolio (não clicável)
                  (photo as any).is_portfolio && (
                    <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gz-black/60
                                    backdrop-blur-sm flex items-center justify-center
                                    border border-red-400/30">
                      <Heart size={12} className="text-red-400 fill-red-400" />
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {displayed.length === 0 && (
          <p className="text-center text-gz-dim py-16 font-display">
            Sem fotos neste período.
          </p>
        )}
      </div>

      {/* ── Lightbox ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.66)', backdropFilter: 'blur(20px)' }}
          onClick={() => setSelected(null)}
        >
          {/* Fechar */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full border border-gz-border
                       flex items-center justify-center text-gz-ghost hover:text-gz-white z-10
                       transition-colors"
            onClick={() => setSelected(null)}
          >
            <X size={18} />
          </button>

          {/* Nav anterior */}
          <button
            onClick={(e) => { e.stopPropagation(); navLightbox(-1) }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                       border border-gz-border flex items-center justify-center
                       text-gz-ghost hover:text-gz-blue transition-colors z-10"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Nav seguinte */}
          <button
            onClick={(e) => { e.stopPropagation(); navLightbox(1) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                       border border-gz-border flex items-center justify-center
                       text-gz-ghost hover:text-gz-blue transition-colors z-10"
          >
            <ChevronRight size={20} />
          </button>

          {/* Conteúdo */}
          <div
            className="flex gap-4 items-start max-w-[95vw] max-h-[95vh] w-full"
            onClick={e => e.stopPropagation()}
          >
            {/* Foto */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected.url}
              alt=""
              className="max-h-[92vh] max-w-full object-contain rounded-lg flex-1"
              style={{ minWidth: 0 }}
            />

            {/* EXIF panel */}
            {selected.exif_data && Object.keys(selected.exif_data).length > 0 && (
              <div className="w-48 flex-shrink-0 gz-card p-4 hidden lg:block">
                <p className="font-display text-xs tracking-widest uppercase text-gz-blue mb-4">
                  EXIF
                </p>
                <div className="space-y-3">
                  {selected.exif_data.camera && (
                    <ExifRow label="Câmara" value={selected.exif_data.camera} />
                  )}
                  {selected.exif_data.lens && (
                    <ExifRow label="Objetiva" value={selected.exif_data.lens} />
                  )}
                  {selected.exif_data.focal_length && (
                    <ExifRow label="Focal" value={selected.exif_data.focal_length} />
                  )}
                  {selected.exif_data.aperture && (
                    <ExifRow label="Abertura" value={`ƒ${selected.exif_data.aperture}`} />
                  )}
                  {selected.exif_data.shutter_speed && (
                    <ExifRow label="Velocidade" value={selected.exif_data.shutter_speed} />
                  )}
                  {selected.exif_data.iso && (
                    <ExifRow label="ISO" value={String(selected.exif_data.iso)} />
                  )}
                  {selected.taken_at && (
                    <ExifRow
                      label="Hora"
                      value={format(new Date(selected.taken_at), 'HH:mm')}
                    />
                  )}
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  {/* Download */}
                  <a
                    href={selected.url}
                    download
                    className="gz-btn-primary text-xs text-center flex items-center justify-center gap-2"
                  >
                    <Download size={12} /> Download
                  </a>

                  {/* Portfolio toggle no lightbox — só admin */}
                  {isAdmin && (
                    <button
                      onClick={(e) => togglePortfolio(e, selected)}
                      className={`gz-btn-ghost text-xs flex items-center justify-center gap-2
                        ${(selected as any).is_portfolio
                          ? 'border-red-400/50 text-red-400'
                          : 'hover:border-red-400/30 hover:text-red-400'
                        }`}
                    >
                      <Heart
                        size={12}
                        className={(selected as any).is_portfolio ? 'fill-red-400' : ''}
                      />
                      {(selected as any).is_portfolio ? 'No Portfolio' : 'Adicionar ao Portfolio'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ExifRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-xs tracking-widest uppercase text-gz-dim mb-0.5">
        {label}
      </p>
      <p className="text-gz-white text-sm font-light">{value}</p>
    </div>
  )
}
