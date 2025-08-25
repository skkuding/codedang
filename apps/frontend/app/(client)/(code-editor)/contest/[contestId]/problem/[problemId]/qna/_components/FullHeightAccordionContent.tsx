'use client'

import { AccordionContent } from '@/components/shadcn/accordion'
import { useEffect, useRef } from 'react'

export function FullHeightAccordionContent({
  children
}: {
  children: React.ReactNode
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const content = contentRef.current
    if (!wrapper || !content) {
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      const parentHeight = wrapper.scrollHeight
      content.style.setProperty(
        '--radix-accordion-content-height',
        `${parentHeight}px`
      )
    })

    resizeObserver.observe(wrapper)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <AccordionContent
      ref={contentRef}
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden transition-all"
    >
      <div ref={wrapperRef} className="w-full">
        {children}
      </div>
    </AccordionContent>
  )
}
