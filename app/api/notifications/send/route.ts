import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'
import { sendPhotosAvailable } from '@/lib/resend'

// Called by admin when marking event as completed (photos ready)
export async function POST(req: Request) {
  const { event_id } = await req.json()
  if (!event_id) return NextResponse.json({ error: 'Missing event_id' }, { status: 400 })

  const admin = createAdminSupabase()

  // Get event
  const { data: event } = await admin.from('events')
    .select('title, slug').eq('id', event_id).single()

  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  // Get subscribers
  const { data: subs } = await admin.from('event_subscriptions')
    .select('email').eq('event_id', event_id)

  if (!subs?.length) return NextResponse.json({ sent: 0 })

  const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.slug}`
  let sent = 0

  for (const sub of subs) {
    try {
      await sendPhotosAvailable({
        to:         sub.email,
        eventTitle: event.title,
        eventUrl,
      })
      sent++
    } catch (e) {
      console.error(`Failed to notify ${sub.email}`, e)
    }
  }

  // Delete subscriptions after notifying
  await admin.from('event_subscriptions').delete().eq('event_id', event_id)

  return NextResponse.json({ sent })
}
