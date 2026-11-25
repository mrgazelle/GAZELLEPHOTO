import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'
import { formatDate, statusLabel } from '@/lib/utils'
import { Plus, Eye, Edit, ImageIcon } from 'lucide-react'

export default async function AdminEventsPage() {
  const supabase = createServerSupabase()
  const { data: events } = await supabase
    .from('events_with_meta')
    .select('*')
    .order('date', { ascending: false })

  return (
    <div className="max-w-5xl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="font-display text-3xl font-bold text-gz-white mb-1">Eventos</h1>
          <p className="text-gz-dim text-sm">{events?.length ?? 0} eventos registados</p>
        </div>
        <Link href="/admin/events/new" className="gz-btn-primary flex items-center gap-2">
          <Plus size={16} /> Novo Evento
        </Link>
      </div>

      <div className="gz-card overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gz-border">
            <tr>
              {['Evento', 'Data', 'Estado', 'Fotos', 'Visibilidade', 'Ações'].map(h => (
                <th key={h} className="px-5 py-3.5 text-left font-display text-xs
                                       tracking-widest uppercase text-gz-dim">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gz-border/50">
            {(events ?? []).map((e: any) => (
              <tr key={e.id} className="hover:bg-gz-elevated/30 transition-colors group">

                {/* Evento + miniatura flyer */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {e.poster_url ? (
                      <div className="w-8 flex-shrink-0 rounded overflow-hidden bg-gz-surface"
                        style={{ aspectRatio: '4/5' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={e.poster_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-8 flex-shrink-0 rounded bg-gz-elevated border border-gz-border
                                      flex items-center justify-center" style={{ aspectRatio: '4/5' }}>
                        <ImageIcon size={10} className="text-gz-border" />
                      </div>
                    )}
                    <div>
                      <p className="font-display text-sm font-medium text-gz-white
                                     group-hover:text-gz-blue transition-colors">
                        {e.title}
                      </p>
                      {e.category_name && (
                        <p className="text-gz-dim text-xs mt-0.5">{e.category_name}</p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Data */}
                <td className="px-5 py-4 text-gz-ghost text-sm whitespace-nowrap">
                  {formatDate(e.date)}
                </td>

                {/* Estado */}
                <td className="px-5 py-4">
                  <span className={`gz-badge status-${e.status}`}>
                    {statusLabel(e.status)}
                  </span>
                </td>

                {/* Fotos */}
                <td className="px-5 py-4">
                  <span className={`font-display text-sm ${
                    (e.photo_count ?? 0) > 0 ? 'text-gz-blue' : 'text-gz-border'
                  }`}>
                    {e.photo_count ?? 0}
                  </span>
                </td>

                {/* Visibilidade */}
                <td className="px-5 py-4">
                  {e.is_public
                    ? <span className="gz-badge bg-green-500/10 text-green-400 border-green-500/20">
                        Público
                      </span>
                    : <span className="gz-badge bg-gz-muted/30 text-gz-ghost border-gz-border">
                        Privado
                      </span>
                  }
                </td>

                {/* Ações */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <ActionBtn
                      href={`/admin/events/${e.id}`}
                      icon={<Edit size={13} />}
                      label="Editar evento"
                      color="blue"
                    />
                    <ActionBtn
                      href={`/events/${e.slug}`}
                      icon={<Eye size={13} />}
                      label="Ver página pública"
                      color="ghost"
                      external
                    />
                    <ActionBtn
                      href={`/admin/events/${e.id}/photos`}
                      icon={<ImageIcon size={13} />}
                      label="Gerir fotos"
                      color="green"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(events ?? []).length === 0 && (
          <div className="text-center py-16 text-gz-dim">
            <p className="font-display mb-4">Sem eventos ainda.</p>
            <Link href="/admin/events/new" className="gz-btn-primary inline-flex">
              Criar primeiro evento
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function ActionBtn({ href, icon, label, color, external }: {
  href: string
  icon: React.ReactNode
  label: string
  color: 'blue' | 'ghost' | 'green'
  external?: boolean
}) {
  const colors = {
    blue:  'border-gz-border text-gz-dim hover:border-gz-blue/50 hover:text-gz-blue hover:bg-gz-blue/5',
    ghost: 'border-gz-border text-gz-dim hover:border-gz-border hover:text-gz-white hover:bg-gz-elevated',
    green: 'border-gz-border text-gz-dim hover:border-green-500/40 hover:text-green-400 hover:bg-green-500/5',
  }
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      title={label}
      className={`w-8 h-8 border rounded-lg flex items-center justify-center
                  transition-all duration-200 ${colors[color]}`}
    >
      {icon}
    </Link>
  )
}
