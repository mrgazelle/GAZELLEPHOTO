import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminUser, unauthorized, forbidden } from '@/lib/api-auth'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { error } = await getAdminUser(req)
  if (error === 'No token' || error === 'Unauthorized') return unauthorized()
  if (error === 'Forbidden') return forbidden()

  const body = await req.json()
  const { data, error: dbError } = await serviceClient()
    .from('categories').update(body).eq('id', params.id).select().single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { error } = await getAdminUser(req)
  if (error === 'No token' || error === 'Unauthorized') return unauthorized()
  if (error === 'Forbidden') return forbidden()

  const { error: dbError } = await serviceClient()
    .from('categories').delete().eq('id', params.id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
