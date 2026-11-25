'use client'
import Image from 'next/image'
import { useState, useMemo } from 'react'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import type { Category, Photo } from '@/types'
import { format } from 'date-fns'

interface Props {
  photos: Photo[]
  categories: Category[]
}

export function PortfolioClient({ photos, categories }: Props) {
  const [active, setActive]     = useState('all')
  const [selected, setSelected] = useState<Photo | null>(null)

  const filtered = useMemo(() =>
  active === 'all'
    ? photos
    : photos.filter((p: any) => {
        // Categoria direta (upload manual)
        if (p.categories?.slug === active) return true
        // Categoria via evento
        if (p.events?.categories?.slug === active) return true
        return false
      }),
  [photos, active]
)

  const navLightbox = (dir: 1 | -1) => {
    if (!selected) return
    const idx = filtered.findIndex(p => p.id === selected.id)
    const next = filtered[idx + dir]
    if (next) setSelected(next)
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-12">
        <FilterBtn label="Todas" value="all" active={active} onClick={setActive} />
        {categories.map((c) => (
          <FilterBtn key={c.id} label={c.name} value={c.slug} active={active} onClick={setActive} />
        ))}
      </div>

      {/* Masonry grid */}
      <div className="photo-grid">
        {filtered.map((photo) => (
          <PhotoItem
            key={photo.id}
            photo={photo}
            onClick={() => setSelected(photo)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-24 text-gz-dim">
          <p className="font-display text-lg">Sem fotos nesta categoria ainda.</p>
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.66)', backdropFilter: 'blur(20px)' }}
          onClick={() => setSelected(null)}
        >
          {/* Fechar */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full border border-gz-border
                       flex items-center justify-center text-gz-ghost hover:text-gz-white
                       transition-colors z-10"
            onClick={() => setSelected(null)}
          >
            <X size={18} />
          </button>

          {/* Anterior */}
          <button
            onClick={(e) => { e.stopPropagation(); navLightbox(-1) }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                       border border-gz-border flex items-center justify-center
                       text-gz-ghost hover:text-gz-blue transition-colors z-10"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Seguinte */}
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
                <div className="mt-5">
                  <a
                    href={selected.url}
                    download
                    className="gz-btn-primary text-xs text-center flex items-center justify-center gap-2"
                  >
                    <Download size={12} /> Download
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function FilterBtn({ label, value, active, onClick }: {
  label: string; value: string; active: string; onClick: (v: string) => void
}) {
  const isActive = active === value
  return (
    <button
      onClick={() => onClick(value)}
      className={`font-display text-xs tracking-widest uppercase px-5 py-2.5 rounded-full
                  border transition-all duration-200
                  ${isActive
                    ? 'bg-gz-blue text-gz-black border-gz-blue'
                    : 'bg-transparent text-gz-ghost border-gz-border hover:border-gz-blue/40 hover:text-gz-white'
                  }`}
    >
      {label}
    </button>
  )
}

function PhotoItem({ photo, onClick }: { photo: Photo; onClick: () => void }) {
  return (
    <div
      className="photo-grid-item group relative overflow-hidden rounded-lg gz-card-hover cursor-pointer"
      onClick={onClick}
    >
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: `${photo.width ?? 3}/${photo.height ?? 4}` }}
      >
        <Image
          src={photo.thumbnail_url}
          alt=""
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

        {/* EXIF no hover */}
        {photo.exif_data && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300
                          flex flex-col justify-end p-4">
            <div className="flex flex-wrap gap-1.5">
              {photo.exif_data.camera && <ExifTag label={photo.exif_data.camera} />}
              {photo.exif_data.aperture && <ExifTag label={`ƒ${photo.exif_data.aperture}`} />}
              {photo.exif_data.shutter_speed && <ExifTag label={photo.exif_data.shutter_speed} />}
              {photo.exif_data.iso && <ExifTag label={`ISO ${photo.exif_data.iso}`} />}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ExifTag({ label }: { label: string }) {
  return (
    <span className="font-display text-xs bg-gz-black/60 backdrop-blur-sm
                     border border-gz-border/50 rounded px-2 py-0.5 text-gz-ghost">
      {label}
    </span>
  )
}

function ExifRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-xs tracking-widest uppercase text-gz-dim mb-0.5">{label}</p>
      <p className="text-gz-white text-sm font-light">{value}</p>
    </div>
  )
}
