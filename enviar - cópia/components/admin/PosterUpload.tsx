'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface Props {
  value: string
  onChange: (url: string) => void
}

export function PosterUpload({ value, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'gazelle/posters')

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: fd,
      })
      const data = await res.json()
      if (data.url) onChange(data.url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {value ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden gz-card group">
          <Image src={value} alt="Poster" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-8 h-8 bg-black/70 rounded-full
                       flex items-center justify-center opacity-0 group-hover:opacity-100
                       transition-opacity hover:text-red-400"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="w-full aspect-video rounded-lg border-2 border-dashed border-gz-border
                     flex flex-col items-center justify-center gap-3 text-gz-dim
                     hover:border-gz-blue/40 hover:text-gz-blue transition-all duration-200
                     disabled:opacity-50"
        >
          {loading
            ? <><span className="w-5 h-5 border-2 border-gz-blue/30 border-t-gz-blue rounded-full animate-spin" />
                <span className="font-display text-xs tracking-widest uppercase">A carregar...</span></>
            : <><ImageIcon size={24} />
                <span className="font-display text-xs tracking-widest uppercase">Clica para adicionar flyer</span>
                <span className="text-xs text-gz-border">JPG, PNG, WEBP</span></>
          }
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}