import { v2 as cloudinary } from 'cloudinary'
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME!, api_key: process.env.CLOUDINARY_API_KEY!, api_secret: process.env.CLOUDINARY_API_SECRET!, secure: true })
export { cloudinary }
export async function uploadPhoto(file: string, eventSlug: string) {
  const result = await cloudinary.uploader.upload(file, {
    folder:       `gazelle/${eventSlug}`,
    resource_type:'image',
    quality:      'auto:best',
    fetch_format: 'auto',
    eager: [
      // Gera thumbnail no upload — fica em cache no Cloudinary
      { width: 800, height: 800, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
    ],
    eager_async: false,
  })

  const thumbnail = cloudinary.url(result.public_id, {
    width:        800,  // ← era 600, aumenta para melhor qualidade
    height:       800,
    crop:         'fill',
    quality:      'auto:good',
    fetch_format: 'auto',
    dpr:          'auto', // ← adapta ao ecrã do utilizador
  })

  return {
    url:           result.secure_url,
    thumbnail_url: thumbnail,
    public_id:     result.public_id,
    width:         result.width,
    height:        result.height,
    exif:          (result as any).image_metadata ?? {},
  }
}
export async function deletePhoto(publicId: string) { return cloudinary.uploader.destroy(publicId) }
