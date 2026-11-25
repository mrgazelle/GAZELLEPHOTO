export async function uploadToCloudinary(
  file: File,
  folder = 'gazelle/portfolio'
): Promise<{ url: string; thumbnail_url: string; public_id: string; width: number; height: number }> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
  fd.append('folder', folder)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: fd }
  )

  if (!res.ok) throw new Error('Cloudinary upload failed')
  const data = await res.json()

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const thumbnail = `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,f_auto,h_800,q_auto,w_800/${data.public_id}`

  return {
    url:           data.secure_url,
    thumbnail_url: thumbnail,
    public_id:     data.public_id,
    width:         data.width,
    height:        data.height,
  }
}