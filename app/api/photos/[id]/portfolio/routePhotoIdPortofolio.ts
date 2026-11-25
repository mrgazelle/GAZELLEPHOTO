// app/api/photos/[id]/portfolio/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminUser, unauthorized, forbidden } from '@/lib/api-auth'
import { revalidatePath } from 'next/cache' 

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { error } = await getAdminUser(req)
  if (error === 'No token' || error === 'Unauthorized') return unauthorized()
  if (error === 'Forbidden') return forbidden()

  const { is_portfolio } = await req.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (is_portfolio) {
    const { data, error: dbError } = await supabase
      .from('favorites')
      .upsert({ user_id: user.id, photo_id: params.id }, { onConflict: 'user_id, photo_id' })
      .select()
      .single()
  } else {
    const { data, error: dbError } = await supabase
      .from('favorites')
      .delete()
      .match({ user_id: user.id, photo_id: params.id })
      .select()
      .maybeSingle()
  }
  const resultData = is_portfolio ? data : data

  console.log('Portfolio update:', data, dbError)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  revalidatePath('/portfolio')

  return NextResponse.json(data)
}