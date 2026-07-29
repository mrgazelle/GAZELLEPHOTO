import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendBookingConfirmation, sendAdminNewBooking } from '@/lib/resend'

export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, category, duration, location,
          photography_type, message, estimated_price_min, estimated_price_max } = body

  if (!name || !email || !category) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase.from('booking_requests').insert({
    name, email, category, duration, location,
    photography_type, message, estimated_price_min, estimated_price_max,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await Promise.allSettled([
    sendBookingConfirmation({ to: email, name, service: category,
      priceMin: estimated_price_min, priceMax: estimated_price_max }),
    sendAdminNewBooking({ clientName: name, clientEmail: email, service: category }),
  ])

  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function GET(req: Request) {
  const { getAdminUser, unauthorized, forbidden } = await import('@/lib/api-auth')
  const { supabase, error } = await getAdminUser(req)
  if (error === 'No token' || error === 'Unauthorized') return unauthorized()
  if (error === 'Forbidden') return forbidden()

  const { data } = await supabase!.from('booking_requests')
    .select('*').order('created_at', { ascending: false })
  return NextResponse.json(data)
}