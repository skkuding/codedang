'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import type { SingleQnaData } from '@/types/type'
import React, { useEffect, useRef } from 'react'
import { FullHeightAccordionContent } from './FullHeightAccordionContent'

interface QnaAccordianProps {
  qnaData: SingleQnaData[]
  qnaInputHeight: number
}

export function QnaAccordion({ qnaData, qnaInputHeight }: QnaAccordianProps) {
  console.log('QnA Data:', qnaData)
  const totalHeight = `calc(100vh - ${qnaInputHeight}px)`
  console.log('Total Height:', totalHeight)
  // const contentRef = useRef<HTMLDivElement>(null)
  // const wrapperRef = useRef<HTMLDivElement>(null)

  // useEffect(() => {
  //   if (!contentRef.current || !wrapperRef.current) {
  //     return
  //   }

  //   const updateHeight = () => {
  //     const parentHeight = wrapperRef.current?.clientHeight ?? 0
  //     contentRef.current?.style.setProperty(
  //       '--radix-accordion-content-height',
  //       `${parentHeight}px`
  //     )
  //   }

  //   // 초기 높이 설정
  //   updateHeight()

  //   // 부모 높이 변화 감지
  //   const resizeObserver = new ResizeObserver(updateHeight)
  //   resizeObserver.observe(wrapperRef.current)

  //   // cleanup
  //   return () => resizeObserver.disconnect()
  // }, [])

  return (
    <div className="flex-1 overflow-hidden">
      <Accordion type="single" collapsible className="flex h-full flex-col">
        {qnaData.map((qna) => (
          <AccordionItem
            key={qna.id}
            value={`item-${qna.id}`}
            //className="flex flex-1 flex-col"
          >
            <AccordionTrigger className="px-4 py-2">
              {qna.title}
            </AccordionTrigger>
            <FullHeightAccordionContent>
              <div className="p-4">{qna.content}</div>
            </FullHeightAccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
