'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import type { ProblemDetail } from '@/types/type'
import { motion } from 'framer-motion'
import { sanitize } from 'isomorphic-dompurify'
import { CheckCircle, Lightbulb, Tag } from 'lucide-react'
import { Clipboard } from 'lucide-react'
import { useState } from 'react'
import useCopyToClipboard from 'react-use/lib/useCopyToClipboard'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './ui/tooltip'

const useCopy = () => {
  const [, copyToClipboard] = useCopyToClipboard()

  // copiedID is used to show the checkmark icon when the user copies the input/output
  const [copiedID, setCopiedID] = useState('')
  const [timeoutID, setTimeoutID] = useState<NodeJS.Timeout | null>(null)

  const copy = (value: string, id: string) => {
    copyToClipboard(value)
    setCopiedID(id)

    // Clear the timeout if it's already set
    // This will prevent the previous setTimeout from executing
    timeoutID && clearTimeout(timeoutID)
    const timeout = setTimeout(() => setCopiedID(''), 2000)
    setTimeoutID(timeout)
  }

  return { copiedID, copy }
}

export function EditorDescription({ problem }: { problem: ProblemDetail }) {
  const { copiedID, copy } = useCopy()

  return (
    <div className="dark flex h-full flex-col gap-8 p-6 text-lg">
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
              <div className="w-full rounded-md bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
                  <h3 className="select-none text-xs font-semibold">Input</h3>
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <motion.div
                        key={copiedID == `input-${id}` ? 'check' : 'clipboard'}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {copiedID == `input-${id}` ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <TooltipTrigger asChild>
                            <Clipboard
                              size={16}
                              className="cursor-pointer transition-opacity hover:opacity-60"
                              onClick={() => {
                                copy(input + '\n\n', `input-${id}`) // add newline to the end for easy testing
                              }}
                            />
                          </TooltipTrigger>
                        )}
                      </motion.div>
                      <TooltipContent>
                        <p>Copy</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <pre className="h-24 w-full overflow-auto px-4 py-2 font-mono text-sm">
                  {input}
                </pre>
              </div>

              <div className="w-full rounded-md bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
                  <h3 className="select-none text-xs font-semibold">Output</h3>
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <motion.div
                        key={copiedID == `output-${id}` ? 'check' : 'clipboard'}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {copiedID == `output-${id}` ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <TooltipTrigger asChild>
                            <Clipboard
                              size={16}
                              className="cursor-pointer transition-opacity hover:opacity-60"
                              onClick={() => {
                                copy(output + '\n\n', `output-${id}`) // add newline to the end for easy testing
                              }}
                            />
                          </TooltipTrigger>
                        )}
                      </motion.div>
                      <TooltipContent>
                        <p>Copy</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <pre className="h-24 w-full overflow-auto px-4 py-2 font-mono text-sm">
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
