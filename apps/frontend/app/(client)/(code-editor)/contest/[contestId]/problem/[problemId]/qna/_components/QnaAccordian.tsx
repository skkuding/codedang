'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import type { SingleQnaData } from '@/types/type'
import React, { useEffect, useRef } from 'react'

interface QnaAccordianProps {
  qnaData: SingleQnaData
}

export function QnaAccordian({ qnaData }: QnaAccordianProps) {
  console.log('QnA Data:', qnaData)
  const contentRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current || !wrapperRef.current) {
      return
    }

    const updateHeight = () => {
      const parentHeight = wrapperRef.current?.clientHeight ?? 0
      contentRef.current?.style.setProperty(
        '--radix-accordion-content-height',
        `${parentHeight}px`
      )
    }

    // 초기 높이 설정
    updateHeight()

    // 부모 높이 변화 감지
    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(wrapperRef.current)

    // cleanup
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div ref={wrapperRef} className="h-64 rounded-lg border">
      <Accordion type="single" collapsible className="h-full">
        <AccordionItem value="item-1" className="h-full">
          <AccordionTrigger className="mx-2">{qnaData.title}</AccordionTrigger>
          <AccordionContent
            ref={contentRef}
            className="mx-2 h-full transition-all duration-300 data-[state=open]:flex data-[state=closed]:hidden"
          >
            <div className="flex-1 p-4">{qnaData.content}</div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
