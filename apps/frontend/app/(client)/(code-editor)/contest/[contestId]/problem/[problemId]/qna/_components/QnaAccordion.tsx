'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import type { SingleQnaData } from '@/types/type'
import React, { useEffect, useRef } from 'react'
import { CommentsArea } from './CommentsArea'

interface QnaAccordianProps {
  qnaData: SingleQnaData[]
}

export function QnaAccordion({ qnaData }: QnaAccordianProps) {
  console.log('QnA Data:', qnaData)

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 overflow-hidden">
        <Accordion type="single" collapsible className="flex h-full flex-col">
          {qnaData.map((qna) => (
            <AccordionItem
              key={qna.id}
              value={`item-${qna.id}`}
              //className="flex flex-1 flex-col"
            >
              <AccordionTrigger className="px-4 pb-0 pt-4 text-[20px] font-semibold">
                {qna.title}
              </AccordionTrigger>
              <AccordionContent className="h-[710px] pb-[30px] pt-3">
                <div className="border-1 mx-5 mb-5 rounded-lg border-[#FFFFFF33] px-5 py-[14px] text-base">
                  {qna.content}
                </div>
                <CommentsArea comments={qna.comments} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </ScrollArea>
  )
}
