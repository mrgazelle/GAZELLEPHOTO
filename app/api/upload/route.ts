import { NextResponse } from 'next/server'
import { getAdminUser, unauthorized, forbidden } from '@/lib/api-auth'
import { cloudinary } from '@/lib/cloudinary'

export async function POST(req: Request) {
  try {
    const { error } = await getAdminUser(req)
    if (error === 'No token' || error === 'Unauthorized') return unauthorized()
    if (error === 'Forbidden') return forbidden()

    const formData = await req.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) ?? 'gazelle/posters'

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const buffer = await file.arrayBuffer()
    const base64 = `data:${file.type};base64,${Buffer.from(buffer).toString('base64')}`

    const result = await cloudinary.uploader.upload(base64, {
      folder,
      quality: 'auto',
      fetch_format: 'auto',
    })

    return NextResponse.json({ url: result.secure_url })
  } catch (err: any) {
    console.error('Upload error:', err?.message ?? err)
    return NextResponse.json({ error: err?.message ?? 'Upload failed' }, { status: 500 })
  }
}