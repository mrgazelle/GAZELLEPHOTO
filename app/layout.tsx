import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Gazelle Photo', template: '%s | Gazelle Photo' },
  description: 'Fotografia com personalidade, emoção e impacto. Urban · Cars · People · Night.',
  openGraph: {
    type: 'website',
    siteName: 'Gazelle Photo',
    title: 'Gazelle Photo',
    description: 'Fotografia com personalidade, emoção e impacto.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className="noise-overlay">
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="bg-gz-black text-gz-white font-body antialiased">
        {children}
      </body>
    </html>
  )
}
