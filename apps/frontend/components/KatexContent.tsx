'use client'

import { renderKatex } from '@/libs/renderKatex'
import { cn } from '@/libs/utils'
import { useEffect, useRef } from 'react'

export function KatexContent({
  content,
  classname
}: {
  content: string | undefined
  classname?: string
}) {
  const katexRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    renderKatex(content, katexRef)
  }, [content, katexRef])
  return (
    <div
      className={cn(
        '[&_code::after]:content-none [&_code::before]:content-none [&_h1]:mb-4 [&_h1]:mt-6 [&_h2]:mb-3 [&_h2]:mt-5 [&_h3]:mb-2 [&_h3]:mt-4 [&_p]:mb-0 [&_p]:mt-2',
        classname
      )}
      ref={katexRef}
    />
  )
}
