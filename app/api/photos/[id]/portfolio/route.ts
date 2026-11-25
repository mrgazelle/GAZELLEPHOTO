import { NextResponse } from 'next/server'
import { getAdminUser, unauthorized, forbidden } from '@/lib/api-auth'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { supabase, error } = await getAdminUser(req)
  if (error === 'No token' || error === 'Unauthorized') return unauthorized()
  if (error === 'Forbidden') return forbidden()

  const { is_portfolio } = await req.json()

  const { data, error: dbError } = await supabase!
    .from('photos')
    .update({ is_portfolio: Boolean(is_portfolio) })
    .eq('id', params.id)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  revalidatePath('/portfolio')

  return NextResponse.json(data)
}