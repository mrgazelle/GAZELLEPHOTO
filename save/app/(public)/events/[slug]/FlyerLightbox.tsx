'use client'
import Image from 'next/image'
import { useState } from 'react'
import { X, ZoomIn } from 'lucide-react'

export function FlyerLightbox({ url, title }: { url: string; title: string }) {
    const [open, setOpen] = useState(false)

    return (
        <>
            {/* Thumbnail 4x5 */}
            <div
                className="relative w-48 md:w-64 flex-shrink-0 rounded-xl overflow-hidden
                   gz-card-hover cursor-pointer group"
                style={{ aspectRatio: '4/5' }}
                onClick={() => setOpen(true)}
            >
                <Image src={url} alt={title} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors
                        flex items-csenter justify-center">
                    <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>

            {/* Lightbox fullscreen */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6"
                    onClick={() => setOpen(false)}
                >
                    <button
                        className="absolute top-4 right-4 w-10 h-10 rounded-full border border-gz-border
                 flex items-center justify-center text-gz-ghost hover:text-gz-white"
                        onClick={() => setOpen(false)}
                    >
                        <X size={18} />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={url}
                        alt={title}
                        className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    )
}