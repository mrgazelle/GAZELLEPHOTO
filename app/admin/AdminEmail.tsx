'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export function AdminEmail() {
  const [email, setEmail] = useState('admin')
  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) setEmail(session.user.email)
    })
  }, [])
  return <p className="font-display text-xs text-gz-dim truncate">{email}</p>
}