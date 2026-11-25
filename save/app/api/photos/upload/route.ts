import { NextResponse } from 'next/server'
import { getAdminUser, unauthorized, forbidden } from '@/lib/api-auth'
import { uploadPhoto } from '@/lib/cloudinary'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { supabase, error } = await getAdminUser(req)
  if (error === 'No token' || error === 'Unauthorized') return unauthorized()
  if (error === 'Forbidden') return forbidden()

  const formData = await req.formData()
  const files = formData.getAll('files') as File[]
  const isPortfolio = formData.get('is_portfolio') === 'true'

  const results = []
  for (const file of files) {
    const buffer = await file.arrayBuffer()
    const base64 = `data:${file.type};base64,${Buffer.from(buffer).toString('base64')}`
    const uploaded = await uploadPhoto(base64, 'portfolio')

    const { data } = await supabase!.from('photos').insert({
      url: uploaded.url,
      thumbnail_url: uploaded.thumbnail_url,
      public_id: uploaded.public_id,
      width: uploaded.width,
      height: uploaded.height,
      is_portfolio: isPortfolio,
      category_id: formData.get('category_id') || null,  // ← adiciona esta linha
      event_id: null,
    }).select().single()

    if (data) results.push(data)
  }

  return NextResponse.json({ uploaded: results.length, photos: results })
}