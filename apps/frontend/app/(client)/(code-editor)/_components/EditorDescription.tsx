'use client'

import { useProblem } from '@/app/(client)/(code-editor)/_components/context/ProblemContext'
import { KatexContent } from '@/components/KatexContent'
import { LevelBadge } from '@/components/LevelBadge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import { convertToLetter } from '@/libs/utils'
import { useTranslate } from '@tolgee/react'
import DOMPurify from 'isomorphic-dompurify'
import { EditorSampleField } from './EditorSampleField'
import { ReferenceDialog } from './ReferenceDialog'

interface EditorDescriptionProps {
  isAssignment?: boolean
  isContest?: boolean
}

export function EditorDescription({
  isAssignment,
  isContest
}: EditorDescriptionProps) {
  const { problem } = useProblem()
  const level = problem.difficulty
  const { t } = useTranslate()

  return (
    <div className="dark flex h-full flex-col gap-6 bg-[#222939] py-6 text-lg">
      <div className="px-6">
        <div className="flex max-h-24 items-center justify-between gap-4">
          <h1 className="overflow-hidden text-ellipsis whitespace-nowrap text-xl font-bold">{`#$${problem?.order !== undefined ? convertToLetter(problem.order) : problem.id}. ${problem.title}`}</h1>
          {!isContest && !isAssignment && (
            <LevelBadge type="dark" level={level} />
          )}
        </div>
        <div className="prose prose-invert mt-5 max-w-full text-sm leading-relaxed text-slate-300">
          <KatexContent content={problem.description} />
        </div>
        <hr className="border-slate-700" />
      </div>

      <div className="px-6">
        <h2 className="mb-3 font-bold">{t('input_section')}</h2>
        <div className="prose prose-invert mb-4 max-w-full text-sm leading-relaxed text-slate-300">
          <KatexContent content={problem.inputDescription} />
        </div>
        <hr className="border-slate-700" />
      </div>

      <div className="px-6">
        <h2 className="mb-3 font-bold">{t('output_section')}</h2>
        <div className="prose prose-invert max-w-full text-sm leading-relaxed text-slate-300">
          <KatexContent content={problem.outputDescription} />
        </div>
      </div>

      <hr className="border-4 border-[#121728]" />

      <EditorSampleField problemTestCase={problem.problemTestcase} />

      <hr className="border-4 border-[#121728]" />

      <div className="flex shrink-0 gap-11 px-6 text-base">
        <div className="space-y-2 text-nowrap">
          <h2>{t('time_limit')}</h2>
          <h2>{t('memory_limit')}</h2>
          <h2>{t('source')}</h2>
        </div>
        <div className="space-y-2 text-slate-300">
          <p>{problem.timeLimit} ms</p>
          <p>{problem.memoryLimit} MB</p>
          <p>{problem.source}</p>
        </div>
      </div>

      <hr className="border-4 border-[#121728]" />

      {problem.hint?.trim() && (
        <>
          <Accordion type="multiple">
            <AccordionItem value="item-1" className="border-none px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center text-base">{t('hint')}</div>
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
        </>
      )}

      <ReferenceDialog />
    </div>
  )
}
