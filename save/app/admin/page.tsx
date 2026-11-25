import { createServerSupabase } from '@/lib/supabase-server'
import { Calendar, ImageIcon, Inbox, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function AdminDashboard() {
  const supabase = createServerSupabase()

  const [
    { count: eventCount },
    { count: photoCount },
    { count: bookingCount },
    { data: recentEvents },
    { data: recentBookings },
    { data: revenue },
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('photos').select('*', { count: 'exact', head: true }),
    supabase.from('booking_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('events').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('booking_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
    supabase.from('revenue_by_month').select('*').limit(3),
  ])

  const totalRevenue = (revenue ?? []).reduce((s: number, r: any) => s + Number(r.total ?? 0), 0)

  const stats = [
    { icon: Calendar,  label: 'Total Eventos',   value: eventCount ?? 0,   href: '/admin/events'  },
    { icon: ImageIcon, label: 'Total Fotos',      value: photoCount ?? 0,   href: '/admin/photos'  },
    { icon: Inbox,     label: 'Pedidos Pendentes',value: bookingCount ?? 0, href: '/admin/bookings', highlight: (bookingCount ?? 0) > 0 },
    { icon: TrendingUp,label: 'Revenue (3m)',     value: `${totalRevenue}€`, href: '/admin/finance' },
  ]

  return (
    <div className="max-w-5xl">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-gz-white mb-1">Dashboard</h1>
        <p className="text-gz-dim text-sm font-light">Bem-vindo ao painel de gestão Gazelle.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {stats.map(({ icon: Icon, label, value, href, highlight }) => (
          <Link key={label} href={href}
            className={`gz-card-hover p-5 group ${highlight ? 'border-gz-blue/40' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <Icon size={16} className={`${highlight ? 'text-gz-blue' : 'text-gz-dim'}`} />
            </div>
            <p className={`font-display text-2xl font-bold mb-1
                           ${highlight ? 'text-gz-blue' : 'text-gz-white'}`}>
              {value}
            </p>
            <p className="font-display text-xs tracking-widest uppercase text-gz-dim">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent events */}
        <div className="gz-card p-6">
          <div className="flex justify-between items-center mb-5">
            <p className="font-display text-xs tracking-widest uppercase text-gz-ghost">
              Eventos Recentes
            </p>
            <Link href="/admin/events"
              className="font-display text-xs tracking-widest uppercase text-gz-blue hover:text-blue-300">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {(recentEvents ?? []).map((e: any) => (
              <Link key={e.id} href={`/admin/events/${e.id}`}
                className="flex justify-between items-center py-2 border-b border-gz-border/50
                           hover:border-gz-blue/20 transition-colors group">
                <div>
                  <p className="text-gz-white text-sm font-display group-hover:text-gz-blue transition-colors">
                    {e.title}
                  </p>
                  <p className="text-gz-dim text-xs mt-0.5">{formatDate(e.date)}</p>
                </div>
                <span className={`gz-badge status-${e.status} text-xs`}>
                  {e.status}
                </span>
              </Link>
            ))}
          </div>
          <Link href="/admin/events/new"
            className="mt-5 w-full gz-btn-primary text-sm flex items-center justify-center gap-2">
            + Novo Evento
          </Link>
        </div>

        {/* Pending bookings */}
        <div className="gz-card p-6">
          <div className="flex justify-between items-center mb-5">
            <p className="font-display text-xs tracking-widest uppercase text-gz-ghost">
              Pedidos Pendentes
            </p>
            <Link href="/admin/bookings"
              className="font-display text-xs tracking-widest uppercase text-gz-blue hover:text-blue-300">
              Ver todos
            </Link>
          </div>
          {(recentBookings ?? []).length === 0
            ? <p className="text-gz-dim text-sm text-center py-8">Sem pedidos pendentes.</p>
            : (
              <div className="space-y-3">
                {(recentBookings ?? []).map((b: any) => (
                  <div key={b.id}
                    className="py-2 border-b border-gz-border/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gz-white text-sm font-display">{b.name}</p>
                        <p className="text-gz-dim text-xs mt-0.5">{b.category} · {b.duration}</p>
                      </div>
                      {b.estimated_price_min && (
                        <p className="font-display text-gz-blue text-sm">
                          {b.estimated_price_min}€–{b.estimated_price_max}€
                        </p>
                      )}
                    </div>
                    <p className="text-gz-border text-xs mt-1">{b.email}</p>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}
