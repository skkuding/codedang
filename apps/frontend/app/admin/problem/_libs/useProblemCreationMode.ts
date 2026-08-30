'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export function useProblemCreationMode() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const useMandeuldang = searchParams.get('mode') === 'mandeuldang'

  const setUseMandeuldang = useCallback(
    (next: boolean) => {
      const params = new URLSearchParams(searchParams.toString())
      if (next) {
        params.set('mode', 'mandeuldang')
      } else {
        params.delete('mode')
      }
      const query = params.toString()
      router.replace(`${pathname}${query ? `?${query}` : ''}`)
    },
    [pathname, router, searchParams]
  )

  return { useMandeuldang, setUseMandeuldang }
}
