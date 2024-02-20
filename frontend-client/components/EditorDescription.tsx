'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import type { ProblemDetail } from '@/types/type'
import { sanitize } from 'isomorphic-dompurify'
import { Lightbulb, Tag } from 'lucide-react'
import { Clipboard } from 'lucide-react'
// import { useState } from 'react'
import useCopyToClipboard from 'react-use/lib/useCopyToClipboard'
import { toast } from 'sonner'

export function EditorDescription({ problem }: { problem: ProblemDetail }) {
  const [, copyToClipboard] = useCopyToClipboard()

  // const handleTextareaChange = (event) => {
  //   setText(event.target.value) // 입력된 내용으로 text 상태 업데이트
  // }

  return (
    <div className="flex h-full flex-col gap-8 p-6 text-lg">
      <div>
        <h1 className="mb-3 text-xl font-bold">{`#${problem.id}. ${problem.title}`}</h1>
        <div
          className="prose prose-invert max-w-full text-sm leading-relaxed text-slate-300"
          dangerouslySetInnerHTML={{ __html: sanitize(problem.description) }}
        />
      </div>
      <div>
        <h2 className="mb-3 font-bold">Input</h2>
        <div
          className="prose prose-invert max-w-full text-sm leading-relaxed text-slate-300"
          dangerouslySetInnerHTML={{
            __html: sanitize(problem.inputDescription)
          }}
        />
      </div>
      <div>
        <h2 className="mb-3 font-bold">Output</h2>
        <div
          className="prose prose-invert max-w-full text-sm leading-relaxed text-slate-300"
          dangerouslySetInnerHTML={{
            __html: sanitize(problem.outputDescription)
          }}
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <h2 className="mb-3 font-bold">Sample Input</h2>
          <Clipboard
            className="size-5 cursor-pointer"
            onClick={() => {
              copyToClipboard('input example')
              toast.success('Successfully copied to clipboard')
            }}
          />
        </div>
        <div className="h-28 w-full resize-none overflow-y-auto rounded-md bg-slate-900 p-2">
          input example
        </div>
      </div>
      <div>
        <h2 className="mb-3 font-bold">Sample Output</h2>
        <div className="h-28 w-full resize-none overflow-y-auto rounded-md bg-slate-900 p-2">
          output example
        </div>
      </div>
      <div className="flex items-center gap-3 text-base">
        <h2>Time Limit:</h2>
        <p className="text-slate-300">{problem.timeLimit} ms</p>
        <h2>Memory Limit:</h2>
        <p className="text-slate-300">{problem.memoryLimit} MB</p>
        <h2>Source:</h2>
        <p className="text-slate-300">{problem.source}</p>
      </div>
      <Accordion type="multiple">
        <AccordionItem value="item-1" className="border-b-slate-700">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2 text-base">
              <Tag size={16} />
              Tags
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {problem.tags.map((tag) => (
              <Badge
                key={tag.id}
                className="bg-slate-300 text-slate-800 hover:bg-slate-300"
              >
                {tag.name}
              </Badge>
            ))}
          </AccordionContent>
        </AccordionItem>
        {problem.hint && (
          <AccordionItem value="item-2" className="border-b-slate-700">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2 text-base">
                <Lightbulb size={16} />
                Hint
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div
                dangerouslySetInnerHTML={{ __html: sanitize(problem.hint) }}
                className="prose prose-invert max-w-full text-sm leading-relaxed text-slate-300"
              />
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
      {/* TODO: Add Compile Version Documentation
       <div className="mt-8 flex gap-3">
        <LucideFileText className="size-7" />
        <p className="text-xs">
          Compile Version <br /> Documentation
        </p>
      </div> */}
    </div>
  )
}
