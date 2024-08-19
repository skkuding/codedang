'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { renderKatex } from '@/lib/renderKatex'
import { convertToLetter } from '@/lib/utils'
import compileIcon from '@/public/compileVersion.svg'
import copyIcon from '@/public/copy.svg'
import copyCompleteIcon from '@/public/copyComplete.svg'
import type { ContestProblem, ProblemDetail } from '@/types/type'
import { motion } from 'framer-motion'
import { sanitize } from 'isomorphic-dompurify'
import { FileText } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
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

export function EditorDescription({
  problem,
  contestProblems
}: {
  problem: ProblemDetail
  contestProblems?: ContestProblem[]
}) {
  const { copiedID, copy } = useCopy()

  const katexRef = useRef<HTMLDivElement>(null)!
  useEffect(() => {
    renderKatex(problem.description, katexRef)
  }, [problem.description, katexRef])

  const katexContent = <div ref={katexRef} />
  const levelNumber = problem.difficulty.slice(-1)
  return (
    <div className="dark flex h-full flex-col gap-6 bg-[#222939] py-6 text-lg">
      <div className="px-6">
        <div className="flex h-6 justify-between">
          <h1 className="mb-3 text-xl font-bold">{`#${contestProblems ? convertToLetter(contestProblems.find((item) => item.id === problem.id)?.order as number) : problem.id}. ${problem.title}`}</h1>
          <Badge
            className={`text-level-light-${levelNumber} rounded-md bg-neutral-500 hover:bg-neutral-500`}
          >
            {`Level ${levelNumber}`}
          </Badge>
        </div>
        <div className="prose prose-invert max-w-full text-sm leading-relaxed text-slate-300">
          {katexContent}
        </div>
        <hr className="border-slate-700" />
      </div>

      <div className="px-6">
        <h2 className="mb-3 font-bold">Input</h2>
        <div
          className="prose prose-invert mb-4 max-w-full text-sm leading-relaxed text-slate-300"
          dangerouslySetInnerHTML={{
            __html: sanitize(problem.inputDescription)
          }}
        />
        <hr className="border-slate-700" />
      </div>

      <div className="px-6">
        <h2 className="mb-3 font-bold">Output</h2>
        <div
          className="prose prose-invert max-w-full text-sm leading-relaxed text-slate-300"
          dangerouslySetInnerHTML={{
            __html: sanitize(problem.outputDescription)
          }}
        />
      </div>

      <hr className="border-4 border-[#121728]" />

      <div>
        {problem.samples.map(({ id, input, output }, index) => {
          const whitespaceStyle =
            'color: rgb(53, 129, 250); min-width: 0.5em; display: inline-block;'
          const changedInput = input
            .replaceAll(/ /g, `<span style="${whitespaceStyle}">␣</span>`)
            .replaceAll(/\n/g, `<span style="${whitespaceStyle}">↵</span>\n`)
            .replaceAll(/\t/g, `<span style="${whitespaceStyle}">↹</span>`)
          const changedOutput = output
            .replaceAll(/ /g, `<span style="${whitespaceStyle}">␣</span>`)
            .replaceAll(/\n/g, `<span style="${whitespaceStyle}">↵</span>\n`)
            .replaceAll(/\t/g, `<span style="${whitespaceStyle}">↹</span>`)
          return (
            <div key={id} className="mb-2 px-6">
              <h2 className="mb-2 font-bold">Sample</h2>

              <div className="flex space-x-2 text-base">
                <div className="w-full space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="select-none text-sm font-semibold">
                      Input {index + 1}
                    </h3>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <motion.div
                          key={
                            copiedID == `input-${id}` ? 'check' : 'clipboard'
                          }
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {copiedID == `input-${id}` ? (
                            <Image
                              src={copyCompleteIcon}
                              alt="copy"
                              width={24}
                            />
                          ) : (
                            <TooltipTrigger asChild>
                              <Image
                                onClick={() => {
                                  copy(input + '\n\n', `input-${id}`) // add newline to the end for easy testing
                                }}
                                className="cursor-pointer transition-opacity hover:opacity-60"
                                src={copyIcon}
                                alt="copy"
                                width={24}
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
                  <div className="bg-[#222939 w-full rounded-md border border-[#555C66]">
                    <pre
                      className="h-24 w-full select-none overflow-auto px-4 py-2 font-mono text-sm"
                      dangerouslySetInnerHTML={{
                        __html: sanitize(changedInput)
                      }}
                    />
                  </div>
                </div>

                <div className="w-full space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="select-none text-sm font-semibold">
                      Output {index + 1}
                    </h3>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <motion.div
                          key={
                            copiedID == `output-${id}` ? 'check' : 'clipboard'
                          }
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {copiedID == `output-${id}` ? (
                            <Image
                              src={copyCompleteIcon}
                              alt="copy"
                              width={24}
                            />
                          ) : (
                            <TooltipTrigger asChild>
                              <Image
                                onClick={() => {
                                  copy(output + '\n\n', `output-${id}`) // add newline to the end for easy testing
                                }}
                                className="cursor-pointer transition-opacity hover:opacity-60"
                                src={copyIcon}
                                alt="copy"
                                width={24}
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
                  <div className="bg-[#222939 w-full rounded-md border-[1px] border-[#555C66]">
                    <pre
                      className="h-24 w-full select-none overflow-auto px-4 py-2 font-mono text-sm"
                      dangerouslySetInnerHTML={{
                        __html: sanitize(changedOutput)
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

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
        <Dialog>
          <DialogTrigger asChild>
            <Image
              className="cursor-pointer"
              src={compileIcon}
              alt="compile"
              width={24}
            />
          </DialogTrigger>
          <DialogContent
            showDarkOverlay={true}
            className="rounded-xl border-none bg-slate-900 text-gray-300 sm:max-w-md"
          >
            <DialogHeader>
              <DialogTitle className="font-normal text-white">
                Compiler Version Document
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-x-auto rounded border border-slate-600">
              <table className="min-w-full bg-slate-900 text-left text-sm">
                <thead className="border-b border-slate-600 bg-slate-800 text-xs">
                  <tr>
                    <th className="px-6 py-3">Language</th>
                    <th className="px-6 py-3">Compiler Version Document</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-600">
                    <td className="flex px-6 py-4">C</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <a
                          href="https://cplusplus.com/reference/clibrary/"
                          target="_blank"
                        >
                          <FileText size={18} />
                        </a>
                        <span>gcc 13.2.0</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href="https://cplusplus.com/reference/clibrary/"
                          target="_blank"
                        >
                          <FileText size={18} />
                        </a>
                        <span>c11</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-600">
                    <td className="flex px-6 py-4">C++</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <a
                          href="https://cplusplus.com/reference/"
                          target="_blank"
                        >
                          <FileText size={18} />
                        </a>
                        <span>g++ 13.2.0</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href="https://cplusplus.com/reference/"
                          target="_blank"
                        >
                          <FileText size={18} />
                        </a>
                        <span>c++ 14</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-600">
                    <td className="flex px-6 py-4">Java</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <a
                          href="https://docs.oracle.com/en/java/javase/17/docs/api/index.html"
                          target="_blank"
                        >
                          <FileText size={18} />
                        </a>
                        <span>openjdk 17.0.11</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="flex px-6 py-4">Python</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <a
                          href="https://docs.python.org/3.12/library/index.html"
                          target="_blank"
                        >
                          <FileText size={18} />
                        </a>
                        <span>python 3.12.3</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
