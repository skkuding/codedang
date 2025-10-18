import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { cn, getResultColor } from '@/libs/utils'
import type { TestResultDetail } from '@/types/type'
import { useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()
  const selectedTestcaseId = searchParams.get('testcaseId')
    ? Number(searchParams.get('testcaseId'))
    : undefined
  const filteredData = selectedTestcaseId
    ? data.filter((testResult) => testResult.id === selectedTestcaseId)
    : []

  return (
    <div className="h-full bg-[#121728] p-4">
      <div className="flex h-full flex-col">
        {!selectedTestcaseId ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-400">Please select a testcase</p>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <table className="min-w-full rounded-t-md">
                <thead className="bg-[#121728] [&_tr]:border-b-slate-600">
                  <tr className="text-base hover:bg-slate-900/60">
                    <th className="w-[25%] p-3 text-left">Input</th>
                    <th className="w-[25%] p-3 text-left">Expected Output</th>
                    <th className="w-[25%] p-3 text-left">Output</th>
                    <th className="w-[15%] p-3 text-left">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((testResult) => (
                    <tr
                      key={testResult.id}
                      className="cursor-pointer border-b border-b-slate-600 text-left hover:bg-slate-700"
                    >
                      <td className="max-w-96 truncate p-3">
                        <WhitespaceVisualizer
                          text={testResult.input}
                          isTruncated={true}
                          className="h-fit max-h-24"
                        />
                      </td>
                      <td className="max-w-96 truncate p-3">
                        <WhitespaceVisualizer
                          text={testResult.expectedOutput}
                          isTruncated={true}
                          className="h-fit max-h-24"
                        />
                      </td>
                      <td className="max-w-96 truncate p-3">
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
        )}
      </div>
    </div>
  )
}
