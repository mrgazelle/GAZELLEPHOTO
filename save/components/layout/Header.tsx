'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/',         label: 'Home'      },
  { href: '/portfolio',label: 'Portfolio' },
  { href: '/events',   label: 'Eventos'   },
  
]

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={cn(
      'fixed top-0 inset-x-0 z-50 transition-all duration-500',
      scrolled
        ? 'bg-gz-black/90 backdrop-blur-md border-b border-gz-border'
        : 'bg-transparent'
    )}>
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group" prefetch={true}>
          <span className="w-2 h-2 bg-gz-blue rounded-full animate-pulse-slow" />
          <span className="font-display text-sm font-bold tracking-[0.2em] uppercase text-gz-white
                           group-hover:text-gz-blue transition-colors duration-300">
            Gazelle Photo
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              prefetch={true}
              className={cn(
                'font-display text-xs font-semibold tracking-widest uppercase transition-colors duration-200',
                pathname === href
                  ? 'text-gz-blue'
                  : 'text-gz-ghost hover:text-gz-white'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-gz-ghost hover:text-gz-white transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        'md:hidden overflow-hidden transition-all duration-300 bg-gz-black border-b border-gz-border',
        open ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
      )}>
        <nav className="container mx-auto px-6 py-6 flex flex-col gap-4">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              prefetch={true}
              onClick={() => setOpen(false)}
              className={cn(
                'font-display text-sm font-semibold tracking-widest uppercase py-2',
                pathname === href ? 'text-gz-blue' : 'text-gz-ghost'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
