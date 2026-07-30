import { NextResponse } from 'next/server'
import { getAdminUser, unauthorized, forbidden } from '@/lib/api-auth'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  console.log('PATCH /api/events/', params.id)
  
  const { supabase, error } = await getAdminUser(req)
  console.log('Auth error:', error)
  
  if (error === 'No token' || error === 'Unauthorized') return unauthorized()
  if (error === 'Forbidden') return forbidden()

  const body = await req.json()
  console.log('Body:', body)

  const { data, error: dbError } = await supabase!
    .from('events').update(body).eq('id', params.id).select().single()

  console.log('DB result:', data, 'DB error:', dbError)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  console.log('DELETE /api/events/', params.id)
  
  const { supabase, error } = await getAdminUser(req)
  if (error === 'No token' || error === 'Unauthorized') return unauthorized()
  if (error === 'Forbidden') return forbidden()

  const { error: dbError } = await supabase!
    .from('events').delete().eq('id', params.id)

  console.log('Delete error:', dbError)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}