import { NextResponse } from 'next/server'
import { getAdminUser, unauthorized, forbidden } from '@/lib/api-auth'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { supabase, error } = await getAdminUser(req)
  if (error === 'No token' || error === 'Unauthorized') return unauthorized()
  if (error === 'Forbidden') return forbidden()

  const body = await req.json()
  const { data, error: dbError } = await supabase!
    .from('events').update(body).eq('id', params.id).select().single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { supabase, error } = await getAdminUser(req)
  if (error === 'No token' || error === 'Unauthorized') return unauthorized()
  if (error === 'Forbidden') return forbidden()

  const { error: dbError } = await supabase!
    .from('events').delete().eq('id', params.id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}