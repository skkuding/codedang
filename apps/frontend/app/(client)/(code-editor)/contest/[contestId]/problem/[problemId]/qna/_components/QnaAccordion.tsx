'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import type { SingleQnaData } from '@/types/type'
import { useState, useRef, useEffect } from 'react'
import { CommentsArea } from './CommentsArea'
import { CreateComments } from './CreateComments'

interface QnaAccordionProps {
  qnaData: SingleQnaData[]
}

export function QnaAccordion({ qnaData }: QnaAccordionProps) {
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(
    undefined
  )
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const handleValueChange = (value: string | undefined) => {
    setOpenAccordion(value)
  }

  function DecideAccordionHeight(value: string) {
    if (openAccordion === value) {
      return 'h-auto opacity-100'
    } else {
      return 'h-0 opacity-0'
    }
  }

  useEffect(() => {
    if (!openAccordion) {
      return
    }

    const triggerEl = triggerRefs.current[openAccordion]
    if (!triggerEl) {
      return
    }

    const scrollOptions: ScrollIntoViewOptions = {
      behavior: 'smooth',
      block: 'start'
    }

    const timeoutId = window.setTimeout(() => {
      triggerEl.scrollIntoView(scrollOptions)
    }, 350)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [openAccordion])

  return (
    <ScrollArea>
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
                <AccordionTrigger
                  ref={(el) => {
                    triggerRefs.current[value] = el
                  }}
                  className="px-5 text-[20px] font-semibold"
                >
                  <p>{qna.title}</p>
                </AccordionTrigger>
                <AccordionContent className="h-[684px] pb-0">
                  <div className="flex h-full flex-col bg-[#121728]">
                    <div className="flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      <div className="bg-[#222939] px-5 pb-5">
                        <div className="border-1 rounded-lg border-[#FFFFFF33] px-5 py-[14px] text-base">
                          {qna.content}
                        </div>
                      </div>
                      <CommentsArea comments={qna.comments} />
                    </div>
                    <div className="shrink-0">
                      <CreateComments qnaOrder={qna.order} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </ScrollArea>
  )
}
