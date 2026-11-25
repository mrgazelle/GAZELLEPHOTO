import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminUser, unauthorized, forbidden } from '@/lib/api-auth'

export async function POST(req: Request) {
  const { error } = await getAdminUser(req)
  if (error === 'No token' || error === 'Unauthorized') return unauthorized()
  if (error === 'Forbidden') return forbidden()

  const body = await req.json()
  const { event_id, url, thumbnail_url, public_id, width, height, is_portfolio, category_id } = body

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error: dbError } = await supabase
    .from('photos')
    .insert({ event_id, url, thumbnail_url, public_id, width, height, is_portfolio, category_id })
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}