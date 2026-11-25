import { NextResponse } from 'next/server'
import { getAdminUser, unauthorized, forbidden } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { supabase, error } = await getAdminUser(req)
  if (error === 'No token' || error === 'Unauthorized') return unauthorized()
  if (error === 'Forbidden') return forbidden()

  const { searchParams } = new URL(req.url)
  const portfolioOnly = searchParams.get('portfolio') === 'true'

  let query = supabase!
  .from('photos')
  .select('*, events(title), categories(name, slug)') 
  .order('created_at', { ascending: false })

  if (portfolioOnly) query = query.eq('is_portfolio', true)

  const { data, error: dbError } = await query
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}