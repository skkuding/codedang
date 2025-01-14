'use client'

import KatexContent from '@/components/KatexContent'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import { Badge } from '@/components/shadcn/badge'
import { convertToLetter } from '@/libs/utils'
import type { ProblemDetail } from '@/types/type'
import DOMPurify from 'isomorphic-dompurify'
import EditorSampleField from './EditorSampleField'
import ReferenceDialog from './ReferenceDialog'

export function EditorDescription({
  problem,
  isContest = false
}: {
  problem: ProblemDetail
  isContest?: boolean
}) {
  const level = problem.difficulty
  const levelNumber = level.slice(-1)

  return (
    <div className="dark flex h-full flex-col gap-6 bg-[#222939] py-6 text-lg">
      <div className="px-6">
        <div className="flex max-h-24 justify-between gap-4">
          <h1 className="mb-3 overflow-hidden text-ellipsis whitespace-nowrap text-xl font-bold">{`#${problem?.order !== undefined ? convertToLetter(problem.order) : problem.id}. ${problem.title}`}</h1>
          {!isContest && (
            <Badge
              className="h-6 w-[52px] whitespace-nowrap rounded-[4px] bg-neutral-500 p-[6px] text-xs font-medium hover:bg-neutral-500"
              textColors={level}
            >
              {`Level ${levelNumber}`}
            </Badge>
          )}
        </div>
        <div className="prose prose-invert max-w-full text-sm leading-relaxed text-slate-300">
          <KatexContent content={problem.description} />
        </div>
        <hr className="border-slate-700" />
      </div>

      <div className="px-6">
        <h2 className="mb-3 font-bold">Input</h2>
        <div className="prose prose-invert mb-4 max-w-full text-sm leading-relaxed text-slate-300">
          <KatexContent content={problem.inputDescription} />
        </div>
        <hr className="border-slate-700" />
      </div>

      <div className="px-6">
        <h2 className="mb-3 font-bold">Output</h2>
        <div className="prose prose-invert max-w-full text-sm leading-relaxed text-slate-300">
          <KatexContent content={problem.outputDescription} />
        </div>
      </div>

      <hr className="border-4 border-[#121728]" />

      <EditorSampleField problemTestCase={problem.problemTestcase} />

      <hr className="border-4 border-[#121728]" />

      <div className="flex shrink-0 gap-11 px-6 text-base">
        <div className="space-y-2 text-nowrap">
          <h2>Time Limit</h2>
          <h2>Memory Limit</h2>
          <h2>Source</h2>
        </div>
        <div className="space-y-2 text-[#B0B0B0]">
          <p>{problem.timeLimit} ms</p>
          <p>{problem.memoryLimit} MB</p>
          <p>{problem.source}</p>
        </div>
      </div>

      <hr className="border-4 border-[#121728]" />

      <Accordion type="multiple">
        <AccordionItem value="item-1" className="border-none px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center text-base">Hint</div>
          </AccordionTrigger>
          <AccordionContent>
            <pre
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(problem.hint)
              }}
              className="prose prose-invert max-w-full whitespace-pre-wrap break-keep text-sm leading-relaxed text-slate-300"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <hr className="border-4 border-[#121728]" />

      <ReferenceDialog />
    </div>
  )
}
