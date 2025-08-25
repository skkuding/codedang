'use client'

import { useQnaCommentsSync } from '@/app/(client)/(code-editor)/_components/context/RefetchingQnaCommentsStoreProvider'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import { Button } from '@/components/shadcn/button'
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevScrollTopRef = useRef<number>(0)

  const { triggerRefresh, refreshTrigger } = useQnaCommentsSync()

  // soft refresh 시 스크롤 복원
  const handleRefresh = () => {
    prevScrollTopRef.current = scrollRef.current?.scrollTop ?? 0
    triggerRefresh()
  }

  // refreshTrigger가 바뀌면 스크롤 위치 복원
  useEffect(() => {
    // 약간의 delay를 줘야 ScrollArea가 렌더링된 후 위치 복원 가능
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: prevScrollTopRef.current })
      }
    }, 50)
  }, [refreshTrigger])

  return (
    <ScrollArea className="h-full" ref={scrollRef}>
      <div className="flex-1 overflow-hidden">
        {/* 전체 Refresh 버튼 */}
        <div className="flex justify-end p-2">
          <Button size="sm" variant="outline" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>

        <Accordion
          type="single"
          collapsible
          value={openAccordion}
          onValueChange={setOpenAccordion}
          className="flex h-full flex-col"
        >
          {qnaData.map((qna) => (
            <AccordionItem
              key={qna.id}
              value={`item-${qna.id}`}
              className="border-[#FFFFFF1A]"
            >
              <AccordionTrigger className="px-5 text-[20px] font-semibold">
                <p>{qna.title}</p>
              </AccordionTrigger>
              <AccordionContent className="h-[700px] pb-0">
                <div className="flex h-full flex-col">
                  {/* 질문 본문 */}
                  <div className="border-1 mx-5 mb-5 rounded-lg border-[#FFFFFF33] px-5 py-[14px] text-base">
                    {qna.content}
                  </div>

                  {/* 댓글 영역 */}
                  <div className="flex-1 overflow-y-auto">
                    <CommentsArea comments={qna.comments} />
                  </div>

                  {/* 댓글 작성 영역 */}
                  <div>
                    <CreateComments qnaOrder={qna.order} />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </ScrollArea>
  )
}
