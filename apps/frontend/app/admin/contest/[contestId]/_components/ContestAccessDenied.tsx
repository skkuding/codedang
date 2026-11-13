'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

export function ContestAccessDenied() {
  const router = useRouter()
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (hasRedirected.current) {
      return
    }
    hasRedirected.current = true
    router.replace('/admin/contest')
    setTimeout(() => {
      toast.error('You do not have access to this contest.')
    }, 100)
  }, [router])

  return null
}
