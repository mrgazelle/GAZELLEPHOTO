import Link from 'next/link'
import { Instagram } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-gz-border bg-gz-deep py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 bg-gz-blue rounded-full animate-pulse-slow" />
              <span className="font-display text-sm font-bold tracking-[0.2em] uppercase">
                Gazelle Photo
              </span>
            </div>
            <p className="text-gz-dim text-sm font-light max-w-xs leading-relaxed">
              A fotografia em cada detalhe.<br />
              Santarém, Portugal.
            </p>
          </div>

          

          {/* Social */}
          <div>
            <p className="font-display text-xs tracking-widest uppercase text-gz-dim mb-4">
              Redes Sociais
            </p>
            <a
              href="https://instagram.com/gazelle.photo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-gz-ghost hover:text-gz-blue transition-colors duration-200 group"
            >
              <span className="w-9 h-9 border border-gz-border rounded-full flex items-center justify-center
                               group-hover:border-gz-blue/50 transition-colors duration-200">
                <Instagram size={16} />
              </span>
              <span className="text-sm font-display">@gazelle.photo</span>
            </a>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gz-border/50 flex flex-col md:flex-row
                        justify-between items-center gap-4 text-xs text-gz-muted font-light">
          <p>© {new Date().getFullYear()} Gazelle Photo. Todos os direitos reservados.</p>
          <p className="text-gz-border">contato@gazellephoto.com</p>
        </div>
      </div>
    </footer>
  )
}
