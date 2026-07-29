import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
export async function getAdminUser(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return { user: null, supabase: null, error: 'No token' }
  const userClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { global: { headers: { Authorization: `Bearer ${token}` } } })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return { user: null, supabase: null, error: 'Unauthorized' }
  const serviceClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: profile } = await serviceClient.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { user: null, supabase: null, error: 'Forbidden' }
  return { user, supabase: serviceClient, error: null }
}
export function unauthorized() { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
export function forbidden() { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
