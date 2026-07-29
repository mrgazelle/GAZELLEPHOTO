'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useMemo } from 'react'
import { Calendar, MapPin, Clock, X } from 'lucide-react'
import { formatDate, statusLabel } from '@/lib/utils'
import type { Event, Category } from '@/types'

interface Props {
    events: Event[]
    categories: Category[]
}

const STATUS_FILTERS = [
    { value: 'upcoming', label: 'Próximos' },
    { value: 'completed', label: 'Concluídos' },
    { value: 'all', label: 'Todos' },
]

export function EventsClient({ events, categories }: Props) {
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')

    const filtered = useMemo(() => {
        return events.filter(e => {
            const matchStatus =
                statusFilter === 'all' ? true :
                    statusFilter === 'upcoming'
                        ? ['scheduled', 'ongoing', 'post-production'].includes(e.status)
                        : e.status === 'completed'

            const matchCat =
                categoryFilter === 'all'
                    ? true
                    : (e as any).category_slug === categoryFilter

            return matchStatus && matchCat
        })
    }, [events, statusFilter, categoryFilter])

    const hasFilters = statusFilter !== 'all' || categoryFilter !== 'all'

    return (
        <>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-10">
                {/* Status */}
                <div className="flex gap-2">
                    {STATUS_FILTERS.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setStatusFilter(f.value)}
                            className={`font-display text-xs tracking-widest uppercase px-4 py-2 rounded-full
                         border transition-all duration-200
                         ${statusFilter === f.value
                                    ? 'bg-gz-blue text-gz-black border-gz-blue'
                                    : 'bg-transparent text-gz-ghost border-gz-border hover:border-gz-blue/40 hover:text-gz-white'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Divider */}
                <div className="w-px bg-gz-border self-stretch" />

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setCategoryFilter('all')}
                        className={`font-display text-xs tracking-widest uppercase px-4 py-2 rounded-full
                       border transition-all duration-200
                       ${categoryFilter === 'all'
                                ? 'bg-gz-elevated text-gz-white border-gz-border'
                                : 'bg-transparent text-gz-ghost border-gz-border hover:border-gz-blue/40 hover:text-gz-white'
                            }`}
                    >
                        Todas
                    </button>
                    {categories.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setCategoryFilter(c.slug)}
                            className={`font-display text-xs tracking-widest uppercase px-4 py-2 rounded-full
                         border transition-all duration-200
                         ${categoryFilter === c.slug
                                    ? 'bg-gz-elevated text-gz-white border-gz-border'
                                    : 'bg-transparent text-gz-ghost border-gz-border hover:border-gz-blue/40 hover:text-gz-white'
                                }`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>

                {/* Clear filters */}
                {hasFilters && (
                    <button
                        onClick={() => { setStatusFilter('all'); setCategoryFilter('all') }}
                        className="flex items-center gap-1.5 font-display text-xs tracking-widest uppercase
                       text-gz-dim hover:text-red-400 transition-colors px-3 py-2"
                    >
                        <X size={12} /> Limpar filtros
                    </button>
                )}
            </div>

            {/* Count */}
            <div className="flex items-center gap-3 mb-8">
                <p className="text-gz-dim text-sm font-light">
                    <span className="font-display text-gz-white">{filtered.length}</span> eventos
                    {hasFilters && ' com os filtros selecionados'}
                </p>
            </div>

            {/* Grid — todos em 4x5, ordem cronológica reversa */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map(e => (
                        <EventCard key={e.id} event={e} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24">
                    <p className="font-display text-lg text-gz-dim mb-2">Sem eventos com estes filtros.</p>
                    <button
                        onClick={() => { setStatusFilter('all'); setCategoryFilter('all') }}
                        className="gz-btn-ghost text-sm mt-4"
                    >
                        Ver todos os eventos
                    </button>
                </div>
            )}
        </>
    )
}

function EventCard({ event }: { event: Event }) {
    const href = `/events/${event.slug}`

    return (
        <Link href={href} className="gz-card group overflow-hidden block transition-all duration-300
                                  hover:border-gz-blue/30">
            {/* Poster 4x5 */}
            <div className="relative overflow-hidden bg-gz-surface" style={{ aspectRatio: '4/5' }}>
                {event.poster_url ? (
                    <Image
                        src={event.poster_url}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gz-elevated">
                        <span className="font-display text-5xl font-bold text-gz-border">
                            {event.title[0]?.toUpperCase()}
                        </span>
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

                {/* Status badge */}
                <div className="absolute top-3 left-3">
                    <span className={`gz-badge status-${event.status}`}>
                        {statusLabel(event.status)}
                    </span>
                </div>

                {/* Photo count */}
                {(event as any).photo_count > 0 && (
                    <div className="absolute top-3 right-3 font-display text-xs bg-gz-black/70
                          border border-gz-border backdrop-blur-sm rounded px-2 py-1 text-gz-ghost">
                        {(event as any).photo_count} fotos
                    </div>
                )}

                {/* Info sobre o poster */}
                <div className="absolute bottom-0 inset-x-0 p-4">
                    {(event as any).category_name && (
                        <p className="font-display text-xs tracking-widest uppercase text-gz-blue mb-1">
                            {(event as any).category_name}
                        </p>
                    )}
                    <h3 className="font-display text-base font-bold text-gz-white group-hover:text-gz-blue
                         transition-colors leading-tight mb-2">
                        {event.title}
                    </h3>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1 text-gz-ghost text-xs">
                            <Calendar size={10} className="text-gz-blue" />
                            {formatDate(event.date)}
                        </span>
                        {event.time_start && (
                            <span className="flex items-center gap-1 text-gz-ghost text-xs">
                                <Clock size={10} className="text-gz-blue" />
                                {event.time_start}
                            </span>
                        )}
                        {event.location && (
                            <span className="flex items-center gap-1 text-gz-ghost text-xs">
                                <MapPin size={10} className="text-gz-blue" />
                                {event.location}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}