import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import type { SingleQnaData } from '@/types/type'
import { CommentsArea } from './CommentsArea'
import { CreateComments } from './CreateComments'

interface QnaAccordianProps {
  qnaData: SingleQnaData[]
}

export function QnaAccordion({ qnaData }: QnaAccordianProps) {
  return (
    <ScrollArea className="h-full">
      <div className="flex-1 overflow-hidden">
        <Accordion type="single" collapsible className="flex h-full flex-col">
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
                  <div className="border-1 mx-5 mb-5 rounded-lg border-[#FFFFFF33] px-5 py-[14px] text-base">
                    {qna.content}
                  </div>
                  <CommentsArea comments={qna.comments} />
                  <div className="justify-self-end">
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
