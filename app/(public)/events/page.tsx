import type { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase-server'
import { EventsClient } from './EventsClient'
import type { Event, Category } from '@/types'
export const revalidate = 3600 // cache por 1 hora

export const metadata: Metadata = {
  title: 'Eventos',
  description: 'Todos os eventos fotografados por Gazelle Photo.',
}

export default async function EventsPage() {
  const supabase = createServerSupabase()
  const [{ data: events }, { data: categories }] = await Promise.all([
    supabase
      .from('events_with_meta')
      .select('*')
      .eq('is_public', true)
      .order('date', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .order('name'),
  ])

  return (
    <div className="min-h-screen bg-gz-black pb-24">
      <div className="container mx-auto px-6">
        <div className="pt-20 pb-12">
          <p className="font-display text-xs tracking-widest uppercase text-gz-blue mb-4">
            Calendário
          </p>
          <h1 className="gz-section-title text-5xl mb-4">Eventos</h1>
          <p className="text-gz-ghost font-light max-w-md">
            Sessões realizadas e futuras.
          </p>
        </div>
        <EventsClient
          events={(events ?? []) as Event[]}
          categories={(categories ?? []) as Category[]}
        />
      </div>
    </div>
  )
}