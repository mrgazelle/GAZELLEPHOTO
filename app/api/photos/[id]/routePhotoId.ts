import { NextResponse } from 'next/server'
import { getAdminUser, unauthorized, forbidden } from '@/lib/api-auth'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { supabase, error } = await getAdminUser(req)
  if (error === 'No token' || error === 'Unauthorized') return unauthorized()
  if (error === 'Forbidden') return forbidden()

  const { error: dbError } = await supabase!
    .from('photos')
    .delete()
    .eq('id', params.id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}