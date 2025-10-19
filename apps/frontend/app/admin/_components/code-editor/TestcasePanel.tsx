import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { cn, getResultColor } from '@/libs/utils'
import type { TestResultDetail } from '@/types/type'
import React from 'react'
import { WhitespaceVisualizer } from './WhitespaceVisualizer'

interface AdminTestResultDetail extends TestResultDetail {
  order?: number
}

interface TestcasePanelProps {
  data: AdminTestResultDetail[]
  isTesting?: boolean
}

const TAB_CONTENT = {
  sample: 'Sample',
  user: 'User',
  hidden: 'Hidden'
}

export function TestcasePanel({ data, isTesting = false }: TestcasePanelProps) {
  const acceptedCount = data.filter((t) => t.result === 'Accepted').length
  const total = data.length
  const notAcceptedTestcases = data
    .filter((t) => t.result !== 'Accepted' && t.result !== 'Judging')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((t) => `#${t.order}`)
    .filter(Boolean)

  return (
    <div className="h-full bg-[#121728]">
      <div className="flex h-full flex-col">
        <div className="border-b border-[#222939] p-4">
          <table className="min-w-full">
            <tbody>
              <tr>
                <td className="w-52 py-1 text-slate-400">Correct Testcase:</td>
                <td className="py-1 text-white">
                  {acceptedCount}/{total}
                </td>
              </tr>
              <tr>
                <td className="w-52 py-1 align-top text-slate-400">
                  Wrong Testcase Number:
                </td>
                <td className="py-1 text-white">
                  {notAcceptedTestcases.length > 0
                    ? notAcceptedTestcases.join(', ')
                    : '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <table className="min-w-full rounded-t-md">
              <thead className="bg-[#121728] [&_tr]:border-b-slate-600">
                <tr className="text-base hover:bg-slate-900/60">
                  <th className="w-[10%] p-3 text-left">No</th>
                  <th className="w-[25%] p-3 text-left">Input</th>
                  <th className="w-[25%] p-3 text-left">Expected Output</th>
                  <th className="w-[25%] p-3 text-left">Output</th>
                  <th className="w-[15%] p-3 text-left">Result</th>
                </tr>
              </thead>
              <tbody>
                {data.map((testResult) => (
                  <tr
                    key={testResult.id}
                    className="cursor-pointer border-b border-b-slate-600 text-left hover:bg-slate-700"
                  >
                    <td className="max-w-96 truncate p-3">
                      {TAB_CONTENT[testResult.type]} #{testResult.order}
                    </td>
                    <td className="max-w-96 truncate p-3 align-top">
                      <WhitespaceVisualizer
                        text={testResult.input}
                        isTruncated={true}
                        className="h-fit max-h-24"
                      />
                    </td>
                    <td className="max-w-96 truncate p-3 align-top">
                      <WhitespaceVisualizer
                        text={testResult.expectedOutput}
                        isTruncated={true}
                        className="h-fit max-h-24"
                      />
                    </td>
                    <td className="max-w-96 truncate p-3 align-top">
                      <WhitespaceVisualizer
                        text={testResult.output}
                        isTruncated={true}
                        className="h-fit max-h-24"
                      />
                    </td>
                    <td
                      className={cn(
                        'p-3 text-left',
                        getResultColor(isTesting ? null : testResult.result)
                      )}
                    >
                      {isTesting ? 'Judging' : testResult.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
