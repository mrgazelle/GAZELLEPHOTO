'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export function AdminGuard({ children, onEmail }: { 
  children: React.ReactNode
  onEmail?: (email: string) => void 
}) {
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('SESSION:', session?.user?.email)
      
      if (!session) {
        console.log('Sem sessão → /login')
        router.replace('/login')
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      console.log('PROFILE:', profile, 'ERROR:', error)

      if (profile?.role === 'admin') {
        onEmail?.(session.user.email ?? 'admin')
        setOk(true)
      } else {
        console.log('Não é admin, role:', profile?.role)
        router.replace('/')
      }
    })
  }, [router])

  if (!ok) return (
    <div className="min-h-screen bg-gz-black flex items-center justify-center">
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 bg-gz-blue rounded-full animate-pulse" />
        <span className="font-display text-xs tracking-widest uppercase text-gz-dim">
          A verificar...
        </span>
      </div>
    </div>
  )

  return <>{children}</>
}