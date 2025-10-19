import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { cn } from '@/libs/utils'
import { useTestcaseStore } from '@/stores/testcaseStore'
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

export function TestcasePanel({ data, isTesting = false }: TestcasePanelProps) {
  const { order, setSelectedTestcase, isHidden, isTestResult } =
    useTestcaseStore()

  const acceptedTestcases = data
    .filter((t) => t.result === 'Accepted')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((t) => ({ order: t.order, id: t.id, isHidden: t.type === 'hidden' }))

  const notAcceptedTestcases = data
    .filter((t) => t.result !== 'Accepted')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((t) => ({ order: t.order, id: t.id, isHidden: t.type === 'hidden' }))

  const filteredData = order
    ? data.filter(
        (testResult) =>
          testResult.order === order &&
          testResult.type === (isHidden ? 'hidden' : 'sample')
      )
    : []

  return (
    <div className="h-full bg-[#121728]">
      <div className="flex h-full flex-col">
        {isTestResult && (
          <div className="border-b border-[#222939] p-4">
            <table className="min-w-full">
              <tbody>
                <tr>
                  <td className="w-20 py-1 align-top text-slate-400">
                    Correct:
                  </td>
                  <td className="py-1 text-white">
                    <div className="max-h-20 overflow-y-auto">
                      {acceptedTestcases.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {acceptedTestcases.map((tc) => (
                            <span
                              key={tc.id}
                              onClick={() => {
                                setSelectedTestcase(tc.order ?? 0, tc.isHidden)
                                console.log('Clicked order:', tc.order)
                              }}
                              className={cn(
                                'cursor-pointer rounded px-1 hover:bg-slate-700',
                                order === tc.order &&
                                  tc.isHidden === isHidden &&
                                  'bg-primary text-white'
                              )}
                            >
                              #{tc.isHidden ? 'H' : 'S'}
                              {tc.order ?? 0}
                            </span>
                          ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="w-20 py-1 align-top text-slate-400">Wrong:</td>
                  <td className="py-1 text-white">
                    <div className="max-h-20 overflow-y-auto">
                      {notAcceptedTestcases.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {notAcceptedTestcases.map((tc) => (
                            <span
                              key={tc.id}
                              onClick={() => {
                                setSelectedTestcase(tc.order ?? 0, tc.isHidden)
                                console.log('Clicked order:', tc.order)
                              }}
                              className={cn(
                                'cursor-pointer rounded px-1 hover:bg-slate-700',
                                order === tc.order &&
                                  tc.isHidden === isHidden &&
                                  'bg-primary text-white'
                              )}
                            >
                              #{tc.isHidden ? 'H' : 'S'}
                              {tc.order ?? 0}
                            </span>
                          ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <div className="flex-1 overflow-hidden p-1">
          <ScrollArea className="h-full">
            <table className="min-w-full rounded-t-md">
              <thead className="bg-[#121728] [&_tr]:border-b-slate-600">
                <tr className="text-base hover:bg-slate-900/60">
                  <th className="w-[25%] p-3 text-left">Input</th>
                  <th className="w-[25%] p-3 text-left">Expected Output</th>
                  <th className="w-[25%] p-3 text-left">Output</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((testResult) => (
                  <tr
                    key={testResult.id}
                    className="cursor-pointer text-left hover:bg-slate-700"
                  >
                    <td className="max-w-96 truncate p-3 align-top">
                      <WhitespaceVisualizer text={testResult.input} />
                    </td>
                    <td className="max-w-96 truncate p-3 align-top">
                      <WhitespaceVisualizer text={testResult.expectedOutput} />
                    </td>
                    <td className="max-w-96 truncate p-3 align-top">
                      <WhitespaceVisualizer text={testResult.output} />
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
