import { NextResponse, type NextRequest } from 'next/server'

const rateLimit = new Map<string, { count: number; reset: number }>()

function checkRate(ip: string, limit: number, windowMs: number) {
  const now = Date.now()
  const entry = rateLimit.get(ip)
  if (!entry || now > entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { pathname } = request.nextUrl

  // Rate limit só nas API routes
  if (pathname.startsWith('/api/')) {
    const limit = pathname.startsWith('/api/auth') ? 20 : 200
    if (!checkRate(ip, limit, 60_000)) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': '60' },
      })
    }
  }

  // Bloqueia métodos perigosos
  if (['TRACE', 'TRACK'].includes(request.method)) {
    return new NextResponse('Method Not Allowed', { status: 405 })
  }

  // Sem redirect de session aqui — AdminGuard trata client-side
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}