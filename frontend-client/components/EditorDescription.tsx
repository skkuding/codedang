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
import useCopyToClipboard from 'react-use/lib/useCopyToClipboard'
import { toast } from 'sonner'

export function EditorDescription({ problem }: { problem: ProblemDetail }) {
  const [, copyToClipboard] = useCopyToClipboard()

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
        {problem.samples.map(({ id, input, output }, index) => (
          <div key={id} className="mb-2">
            <h2 className="mb-2 font-bold">Sample {index + 1}</h2>

            <div className="flex space-x-2 text-base">
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <h3 className="mb-1 font-semibold">Input</h3>
                  <Clipboard
                    className="size-[18px] cursor-pointer"
                    onClick={() => {
                      copyToClipboard(input + '\n') // add newline to the end for easy testing
                      toast.success('Successfully copied input to clipboard')
                    }}
                  />
                </div>
                <pre className="h-28 w-full cursor-default resize-none overflow-y-auto rounded-md bg-slate-900 px-4 py-3 font-mono outline-none">
                  {input}
                </pre>
              </div>

              <div className="w-full">
                <h3 className="mb-1 font-semibold">Output</h3>
                <pre className="h-28 w-full overflow-y-auto rounded-md bg-slate-900 p-2 px-4 py-3">
                  {output}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="items-center space-y-1 text-base">
        <div className="flex gap-3">
          <h2>Time Limit:</h2>
          <p className="text-slate-300">{problem.timeLimit} ms</p>
        </div>
        <div className="flex gap-3">
          <h2>Memory Limit:</h2>
          <p className="text-slate-300">{problem.memoryLimit} MB</p>
        </div>
        <div className="flex gap-3">
          <h2>Source:</h2>
          <p className="text-slate-300">{problem.source}</p>
        </div>
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
