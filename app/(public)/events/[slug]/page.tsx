import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase-server'
import { formatDate, statusLabel } from '@/lib/utils'
import { Calendar, MapPin, Clock, Camera, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { EventGalleryClient } from './EventGalleryClient'
import type { Event, Photo } from '@/types'
import { FlyerLightbox } from './FlyerLightbox'
export const revalidate = 300 // 5 minutos para eventos

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('events').select('title, description').eq('slug', params.slug).single()
  return { title: data?.title ?? 'Evento', description: data?.description }
}

export default async function EventPage({ params }: Props) {
  const supabase = createServerSupabase()

  const { data: event } = await supabase
    .from('events_with_meta')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_public', true)
    .single()

  if (!event) notFound()

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', event.id)
    .order('taken_at', { ascending: true })

  const ev = event as Event & { category_name?: string; photo_count?: number }
  const photoList = (photos ?? []) as Photo[]

  return (
    <div className="min-h-screen bg-gz-black pb-24">
      {/* Hero */}
      <div className="relative py-20 overflow-hidden border-b border-gz-border">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: ev.poster_url ? `url(${ev.poster_url})` : undefined,
            backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(40px)',
          }}
        />
        <div className="container mx-auto px-6 relative z-10">
          <Link href="/events"
            className="inline-flex items-center gap-2 text-gz-dim hover:text-gz-blue
                 transition-colors font-display text-xs tracking-widest uppercase mb-8">
            <ArrowLeft size={14} /> Todos os eventos
          </Link>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
            {/* Flyer 4x5 — clicável para ver em grande */}
            {ev.poster_url && (
              <FlyerLightbox url={ev.poster_url} title={ev.title} />
            )}

            <div className="flex-1">
              {ev.category_name && (
                <p className="font-display text-xs tracking-widest uppercase text-gz-blue mb-3">
                  {ev.category_name}
                </p>
              )}
              <h1 className="gz-section-title text-4xl md:text-5xl mb-6">{ev.title}</h1>

              <div className="flex flex-wrap gap-5 text-gz-ghost text-sm">
                <span className="flex items-center gap-2">
                  <Calendar size={14} className="text-gz-blue" />
                  {formatDate(ev.date, 'd MMMM yyyy')}
                </span>
                {ev.time_start && (
                  <span className="flex items-center gap-2">
                    <Clock size={14} className="text-gz-blue" />
                    {ev.time_start}{ev.time_end ? ` – ${ev.time_end}` : ''}
                  </span>
                )}
                {ev.location && (
                  <span className="flex items-center gap-2">
                    <MapPin size={14} className="text-gz-blue" />
                    {ev.location}
                  </span>
                )}
                {photoList.length > 0 && (
                  <span className="flex items-center gap-2">
                    <Camera size={14} className="text-gz-blue" />
                    {photoList.length} fotos
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-3">
              <span className={`gz-badge status-${ev.status} text-sm`}>
                {statusLabel(ev.status)}
              </span>
              
            </div>
          </div>

          {ev.description && (
            <p className="mt-6 text-gz-ghost font-light max-w-2xl leading-relaxed">
              {ev.description}
            </p>
          )}
        </div>
      </div>

      {/* Gallery or placeholder */}
      <div className="container mx-auto px-6 pt-12">
        {photoList.length > 0
          ? <EventGalleryClient photos={photoList} event={ev as Event} />
          : (
            <div className="text-center py-32">
              {ev.status === 'post-production'
                ? (
                  <>
                    <p className="font-display text-xl text-gz-white mb-3">
                      Fotos em pós-produção
                    </p>
                    <p className="text-gz-dim font-light mb-8">
                      As fotos estão a ser editadas. Subscreve para ser notificado quando estiverem prontas.
                    </p>
                    
                  </>
                )
                : (
                  <p className="font-display text-xl text-gz-dim">
                    As fotos ainda não estão disponíveis.
                  </p>
                )
              }
            </div>
          )
        }
      </div>
    </div>
  )
}
