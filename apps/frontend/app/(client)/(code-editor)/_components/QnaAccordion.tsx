'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import type { SingleQnaData } from '@/types/type'
import { useState } from 'react'
import { CommentsArea } from './CommentsArea'
import { CreateComments } from './CreateComments'

interface QnaAccordionProps {
  qnaData: SingleQnaData[]
  contestId?: number
  courseId?: number
}

export function QnaAccordion({
  qnaData,
  contestId,
  courseId
}: QnaAccordionProps) {
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(
    undefined
  )
  const handleValueChange = (value: string | undefined) => {
    setOpenAccordion(value)
  }

  function DecideAccordionHeight(value: string) {
    if (openAccordion === value) {
      return 'h-auto opacity-100'
    } else {
      return 'h-0 opacity-0 border-0 p-0 m-0 overflow-hidden'
    }
  }

  const openQna = qnaData.find((qna) => `item-${qna.id}` === openAccordion)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div>
          <Accordion
            type="single"
            collapsible
            value={openAccordion}
            onValueChange={handleValueChange}
            className="flex h-full flex-col"
          >
            {qnaData.map((qna) => {
              const value = `item-${qna.id}`
              return (
                <AccordionItem
                  key={qna.id}
                  value={value}
                  className={`overflow-hidden border-[#FFFFFF1A] transition-all duration-300 ${
                    openAccordion
                      ? DecideAccordionHeight(value)
                      : 'h-auto opacity-100'
                  }`}
                >
                  <AccordionTrigger className="px-5 text-[20px] font-semibold">
                    <p>{qna.title}</p>
                  </AccordionTrigger>
                  <AccordionContent className="bg-[#121728]">
                    <div className="bg-[#222939] px-5 pb-5">
                      <div className="border-1 break-all rounded-lg border-[#FFFFFF33] px-5 py-[14px] text-base">
                        {qna.content}
                      </div>
                    </div>
                    <CommentsArea comments={qna.comments} />
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>
      </ScrollArea>
      {openQna && (
        <div className="shrink-0 bg-[#121728]">
          <CreateComments
            qnaOrder={openQna.order}
            contestId={contestId}
            courseId={courseId}
          />
        </div>
      )}
    </div>
  )
}
