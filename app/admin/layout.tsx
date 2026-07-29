import Link from 'next/link'
import { AdminGuard } from './AdminGuard'
import { AdminEmail } from './AdminEmail'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import {
  LayoutDashboard, Calendar, ImageIcon, Tag, BarChart3, LogOut, Settings
} from 'lucide-react'


const NAV = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/events', icon: Calendar, label: 'Eventos' },
  { href: '/admin/photos', icon: ImageIcon, label: 'Fotos' },
  { href: '/admin/categories', icon: Tag, label: 'Categorias' },
  { href: '/admin/bookings', icon: Settings, label: 'Pedidos' },
  { href: '/admin/finance', icon: BarChart3, label: 'Finanças' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // const supabase = createServerSupabase()
  // const { data: { session } } = await supabase.auth.getSession()
  // if (!session) redirect('/login')

  // const { data: profile } = await supabase
  //   .from('profiles').select('role').eq('id', session.user.id).single()
  // if (profile?.role !== 'admin') redirect('/')

  // const userEmail = session.user.email ?? 'admin'


  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gz-black">
        {/* Sidebar */}
        <aside className="w-56 border-r border-gz-border bg-gz-deep flex flex-col fixed h-full z-40">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-gz-border">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-gz-blue rounded-full animate-pulse-slow" />
              <span className="font-display text-xs font-bold tracking-[0.2em] uppercase text-gz-white">
                Gazelle Admin
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {NAV.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gz-ghost
                         hover:bg-gz-elevated hover:text-gz-white transition-all duration-200
                         font-display text-xs tracking-wider uppercase group">
                <Icon size={15} className="group-hover:text-gz-blue transition-colors" />
                {label}
              </Link>
            ))}
          </nav>

          {/* User */}
          <div className="px-3 py-4 border-t border-gz-border">
            <div className="px-3 py-2 mb-1">
              <AdminEmail />
            </div>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gz-ghost
                         hover:bg-gz-elevated hover:text-red-400 transition-all duration-200
                         font-display text-xs tracking-wider uppercase"
              >
                <LogOut size={15} /> Sair
              </button>
            </form>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 ml-56 p-8">
          {children}
        </main>
      </div>
    </AdminGuard>
  )
}
