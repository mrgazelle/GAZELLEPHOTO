import type { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase-server'
import { PortfolioClient } from './PortfolioClient'
import type { Category, Photo } from '@/types'
export const revalidate = 3600 // cache por 1 hora

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Galeria completa — Urban, Cars, People, Night.',
}

export default async function PortfolioPage() {
  const supabase = createServerSupabase()

  const [{ data: categories }, { data: photos }] = await Promise.all([
  supabase.from('categories').select('*').order('name'),
  supabase
  .from('photos')
  .select(`
    *,
    events(is_public, category_id, categories(name, slug)),
    categories(name, slug)
  `)
  .eq('is_portfolio', true)
  .order('created_at', { ascending: false })
  .limit(60),
])
  

  return (
    <div className="min-h-screen bg-gz-black pt-8 pb-24">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-16 pt-10">
          <p className="font-display text-xs tracking-widest uppercase text-gz-blue mb-4">
            Galeria
          </p>
          <h1 className="gz-section-title text-5xl mb-4">Portfolio</h1>
          <p className="text-gz-ghost font-light max-w-md">
            Uma jornada visual através do meu olhar fotográfico.
          </p>
        </div>

        <PortfolioClient
          photos={(photos ?? []) as Photo[]}
          categories={(categories ?? []) as Category[]}
        />
      </div>
    </div>
  )
}
