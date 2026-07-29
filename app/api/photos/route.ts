export const maxDuration = 60 // segundos
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getAdminUser, unauthorized, forbidden } from '@/lib/api-auth'
import { uploadPhoto } from '@/lib/cloudinary'

export async function POST(req: Request) {
  const { supabase, error } = await getAdminUser(req)
  if (error === 'No token' || error === 'Unauthorized') return unauthorized()
  if (error === 'Forbidden') return forbidden()

  const formData = await req.formData()
  const files = formData.getAll('files') as File[]
  const eventId = formData.get('event_id') as string
  const eventSlug = formData.get('event_slug') as string

  if (!files.length || !eventId) {
    return NextResponse.json({ error: 'Missing files or event_id' }, { status: 400 })
  }

  const results = []
  for (const file of files) {
    const buffer = await file.arrayBuffer()
    const base64 = `data:${file.type};base64,${Buffer.from(buffer).toString('base64')}`
    const uploaded = await uploadPhoto(base64, eventSlug ?? 'general')

    const exif_data = {
      camera: uploaded.exif?.Model ?? uploaded.exif?.Make,
      iso: uploaded.exif?.ISOSpeedRatings ? Number(uploaded.exif.ISOSpeedRatings) : undefined,
      aperture: uploaded.exif?.FNumber,
      shutter_speed: uploaded.exif?.ExposureTime,
      focal_length: uploaded.exif?.FocalLength,
      lens: uploaded.exif?.LensModel,
    }

    const { data } = await supabase!.from('photos').insert({
      event_id: eventId,
      url: uploaded.url,
      thumbnail_url: uploaded.thumbnail_url,
      public_id: uploaded.public_id,
      width: uploaded.width,
      height: uploaded.height,
      exif_data,
    }).select().single()

    if (data) results.push(data)
  }

  return NextResponse.json({ uploaded: results.length, photos: results }, { status: 201 })
}