'use client'

import KatexContent from '@/components/KatexContent'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { convertToLetter } from '@/lib/utils'
import type { ContestProblem, ProblemDetail } from '@/types/type'
import type { Level } from '@/types/type'
import { sanitize } from 'isomorphic-dompurify'
import EditorSampleField from './EditorSampleField'
import ReferenceDialog from './ReferenceDialog'

export function EditorDescription({
  problem,
  contestProblems,
  isContest = false
}: {
  problem: ProblemDetail
  contestProblems?: ContestProblem[]
  isContest?: boolean
}) {
  const level = problem.difficulty
  const levelNumber = level.slice(-1)
  return (
    <div className="dark flex h-full flex-col gap-6 bg-[#222939] py-6 text-lg">
      <div className="px-6">
        <div className="flex max-h-24 justify-between gap-4">
          <h1 className="mb-3 overflow-hidden text-ellipsis whitespace-nowrap text-xl font-bold">{`#${contestProblems ? convertToLetter(contestProblems.find((item) => item.id === problem.id)?.order as number) : problem.id}. ${problem.title}`}</h1>
          {!isContest && (
            <Badge
              className="h-6 w-[52px] whitespace-nowrap rounded-[4px] bg-neutral-500 p-[6px] text-xs font-medium hover:bg-neutral-500"
              textColors={level as Level}
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
        <div className="space-y-2">
          <h2 className="text-nowrap">Time Limit</h2>
          <h2 className="text-nowrap">Memory Limit</h2>
          <h2 className="text-nowrap">Source</h2>
        </div>
        <div className="space-y-2">
          <p className="text-slate-400">{problem.timeLimit} ms</p>
          <p className="text-slate-400">{problem.memoryLimit} MB</p>
          <p className="text-slate-400">{problem.source}</p>
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
              dangerouslySetInnerHTML={{ __html: sanitize(problem.hint) }}
              className="prose prose-invert max-w-full text-sm leading-relaxed text-slate-300"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <hr className="border-4 border-[#121728]" />

      <div className="flex px-6">
        <ReferenceDialog />
      </div>
    </div>
  )
}
