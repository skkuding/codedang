'use client'

import KatexContent from '@/components/KatexContent'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import { Badge } from '@/components/shadcn/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shadcn/dialog'
import { convertToLetter } from '@/libs/utils'
import compileIcon from '@/public/icons/compile-version.svg'
import type { ProblemDetail } from '@/types/type'
import { sanitize } from 'isomorphic-dompurify'
import { FileText } from 'lucide-react'
import Image from 'next/image'
import CopyButton from './CopyButton'
import { WhitespaceVisualizer } from './WhitespaceVisualizer'

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

      <div>
        {problem.problemTestcase.map(({ id, input, output }, index) => {
          return (
            <div key={id} className="mb-2 px-6">
              <h2 className="mb-2 font-bold">Sample</h2>

              <div className="flex space-x-2 text-base">
                <div className="w-1/2 space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="select-none text-sm font-semibold">
                      Input {index + 1}
                    </h3>
                    <CopyButton value={input} />
                  </div>
                  <div className="rounded-md border border-[#555C66]">
                    <WhitespaceVisualizer text={input} className="px-4 py-2" />
                  </div>
                </div>

                <div className="w-1/2 space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="select-none text-sm font-semibold">
                      Output {index + 1}
                    </h3>
                    <CopyButton value={output} />
                  </div>
                  <div className="rounded-md border-[1px] border-[#555C66]">
                    <WhitespaceVisualizer text={output} className="px-4 py-2" />
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
              className="prose prose-invert max-w-full whitespace-pre-wrap break-keep text-sm leading-relaxed text-slate-300"
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
