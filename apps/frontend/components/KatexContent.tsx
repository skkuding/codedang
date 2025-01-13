'use client'

import { renderKatex } from '@/libs/renderKatex'
import { useEffect, useRef } from 'react'

export default function KatexContent({
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
  return <div className={classname} ref={katexRef} />
}
