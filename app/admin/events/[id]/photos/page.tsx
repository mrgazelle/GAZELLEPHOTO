import { uploadToCloudinary } from '@/lib/cloudinary-upload'

async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const files = Array.from(e.target.files ?? [])
  if (!files.length || !event) return

  setUploading(true)
  setProgress({ done: 0, total: files.length })
  const token = await getToken()

  for (let i = 0; i < files.length; i++) {
    try {
      // 1. Upload direto para Cloudinary (sem passar pelo Vercel)
      const uploaded = await uploadToCloudinary(files[i], `gazelle/${event.slug}`)

      // 2. Guarda só o URL na base de dados (request pequeno, sem timeout)
      await fetch('/api/photos/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          event_id:      id,
          url:           uploaded.url,
          thumbnail_url: uploaded.thumbnail_url,
          public_id:     uploaded.public_id,
          width:         uploaded.width,
          height:        uploaded.height,
        }),
      })
    } catch (err) {
      console.error('Erro no upload:', err)
    }
    setProgress({ done: i + 1, total: files.length })
  }

  await loadPhotos()
  setUploading(false)
  setProgress({ done: 0, total: 0 })
  if (inputRef.current) inputRef.current.value = ''
}