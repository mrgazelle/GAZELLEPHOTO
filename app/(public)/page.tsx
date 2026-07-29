import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Moon, Car, Users, MapPin, Instagram } from 'lucide-react'
import { createServerSupabase } from '@/lib/supabase-server'
import type { Event, Photo } from '@/types'
export const revalidate = 3600 // cache por 1 hora

const INSTAGRAM_URL = 'https://instagram.com/gazelle.photo'


async function getHomeData() {
  const supabase = createServerSupabase()
  const [eventsRes, photosRes] = await Promise.all([
    supabase
      .from('events_with_meta')
      .select('*')
      .eq('is_public', true)
      .in('status', ['scheduled', 'ongoing'])
      .order('date', { ascending: true })
      .limit(3),
    supabase
      .from('photos')
      .select('*, events!inner(is_public)')
      .eq('events.is_public', true)
      .order('created_at', { ascending: false })
      .limit(9),
  ])
  return {
    events: (eventsRes.data ?? []) as Event[],
    photos: (photosRes.data ?? []) as Photo[],
  }
}

const SERVICES = [
  { icon: Moon, title: 'Gazelle Night', slug: 'night', desc: 'Discotecas, bares e eventos de nightlife. A energia da noite em cada frame.', price: 'Desde 50€' },
  { icon: Car, title: 'Gazelle Cars', slug: 'cars', desc: 'Sessões automóvel com detalhe e composições que valorizam cada linha.', price: 'Desde 60€' },
  { icon: Users, title: 'Gazelle People', slug: 'people', desc: 'Retratos pessoais, branding e eventos privados com personalidade.', price: 'Desde 40€' },
]

export default async function HomePage() {
  const { events, photos } = await getHomeData()

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pb-24">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(96,165,250,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)' }} />
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 border border-gz-blue/20 rounded-full
                          px-4 py-1.5 mb-8 bg-gz-blue/5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-gz-blue rounded-full animate-pulse-slow" />
            <span className="font-display text-xs tracking-widest uppercase text-gz-blue">
              Santarém, Portugal
            </span>
          </div>

          <h1 className="font-display text-6xl md:text-8xl font-bold tracking-tight mb-6
                         bg-gradient-to-b from-gz-white to-gz-dim bg-clip-text text-transparent">
            GAZELLE<br />PHOTO
          </h1>

          <p className="text-gz-ghost text-lg md:text-xl font-light mb-10 max-w-md mx-auto leading-relaxed">
            Ainda estou no início.<br />
            Mas já gosto do que vejo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/portfolio" className="gz-btn-primary flex items-center justify-center gap-2">
              Ver Portfolio
            </Link>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
              className="gz-btn-ghost flex items-center justify-center gap-2">
              <Instagram size={16} /> Segue-me
            </a>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
            <span className="font-display text-xs tracking-widest uppercase text-gz-dim">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-gz-dim to-transparent" />
          </div>
        </div>
      </section>





      {/* ── ABOUT ── */}
      {/* ── CTA COM FOTO ── */}
<section className="py-24 bg-gz-surface">
  <div className="container mx-auto px-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      {/* Foto */}
      <div className="relative">
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden gz-card">
          <Image
            src="https://res.cloudinary.com/dt2b1sizs/image/upload/v1783602299/DSC05429_okpgql.jpg"
            alt="Gazelle Photo"
            fill className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gz-blue/20 rounded-lg
                        border border-gz-blue/30 backdrop-blur-sm" />
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-gz-blue rounded-lg
                        flex items-center justify-center shadow-lg shadow-gz-blue/20">
          
        </div>
      </div>

      {/* CTA */}
      <div>
        <p className="font-display text-xs tracking-widest uppercase text-gz-blue mb-6">
          Contacto
        </p>
        <h2 className="gz-section-title mb-6 leading-tight">
          Tens um projeto<br />
          ou evento em mente?
        </h2>
        <p className="text-gz-ghost font-light leading-relaxed mb-10 text-lg">
          Independente do serviço, fala comigo!
        </p>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="gz-btn-primary inline-flex items-center gap-2 text-base px-8 py-4"
        >
         Falar com Gazelle
        </a>
      </div>
    </div>
  </div>
</section>

      {/* ── PRÓXIMOS EVENTOS ── */}
      {events.length > 0 && (
        <section className="py-24 bg-gz-deep">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div>
                <p className="font-display text-xs tracking-widest uppercase text-gz-blue mb-3">Calendário</p>
                <h2 className="gz-section-title">Próximos Eventos</h2>
              </div>
              <Link href="/events"
                className="hidden md:flex items-center gap-2 text-gz-ghost hover:text-gz-blue
                           transition-colors font-display text-xs tracking-widest uppercase">
                Ver todos <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.slug}`}
                  className="gz-card-hover group overflow-hidden block">
                  <div className="relative overflow-hidden bg-gz-surface" style={{ aspectRatio: '4/5' }}>
                    {event.poster_url ? (
                      <Image src={event.poster_url} alt={event.title} fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gz-elevated">
                        <span className="font-display text-5xl font-bold text-gz-border">
                          {event.title[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className={`gz-badge status-${event.status}`}>
                        {event.status === 'ongoing' ? 'A decorrer' : 'Agendado'}
                      </span>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-4">
                      <p className="font-display text-xs tracking-widest uppercase text-gz-blue mb-1">
                        {(event as any).category_name ?? 'Evento'}
                      </p>
                      <h3 className="font-display text-lg font-bold text-gz-white
                                     group-hover:text-gz-blue transition-colors leading-tight">
                        {event.title}
                      </h3>
                      <p className="text-gz-ghost text-xs mt-1">{event.date}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link href="/events" className="gz-btn-ghost inline-flex items-center gap-2">
                Ver todos os eventos <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

    
    </>
  )
}
