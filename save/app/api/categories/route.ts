import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminUser, unauthorized, forbidden } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

function serviceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function GET() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data } = await sb.from('categories').select('*').order('name')
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  const { error } = await getAdminUser(req)
  if (error === 'No token' || error === 'Unauthorized') return unauthorized()
  if (error === 'Forbidden') return forbidden()
  const body = await req.json()
  if (!body.name || !body.slug) return NextResponse.json({ error: 'name e slug obrigatórios' }, { status: 400 })
  const { data, error: dbError } = await serviceClient().from('categories').insert(body).select().single()
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
