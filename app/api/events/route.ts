import { NextResponse } from 'next/server'
import { getAdminUser, unauthorized, forbidden } from '@/lib/api-auth'
import { slugify } from '@/lib/utils'

export async function GET() {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await supabase
    .from('events_with_meta').select('*').eq('is_public', true).order('date', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { supabase, error } = await getAdminUser(req)
  if (error === 'No token' || error === 'Unauthorized') return unauthorized()
  if (error === 'Forbidden') return forbidden()

  const body = await req.json()
  if (!body.title || !body.date) {
    return NextResponse.json({ error: 'title e date são obrigatórios' }, { status: 400 })
  }

  const slug = slugify(body.title) + '-' + Date.now().toString(36)

  const { data, error: dbError } = await supabase!
    .from('events')
    .insert({ ...body, slug })
    .select()
    .single()

  if (dbError) {
    console.error('DB Error:', dbError)
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}