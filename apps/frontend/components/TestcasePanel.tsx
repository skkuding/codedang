'use client'

import { cn } from '@/lib/utils'
import type { TestcaseResult } from '@/types/type'
import { useState } from 'react'
import TestcaseTable from './TestcaseTable'
import { ScrollArea } from './ui/scroll-area'

export default function TestcasePanel({ data }: { data: TestcaseResult[] }) {
  const [testcaseTabList, setTestcaseTabList] = useState<TestcaseResult[]>([])
  const [currentTab, setCurrentTab] = useState<number>(0)
  const acceptedConunt = data.filter(
    (testcase) => testcase.result === 'Accepted'
  ).length
  const total = data.length
  const dataWithIndex = data.map((testcase, index) => ({
    ...testcase,
    id: index + 1
  }))
  const notAcceptedIndexes = dataWithIndex
    .map((testcase, index) => (testcase.result !== 'Accepted' ? index : -1))
    .filter((index) => index !== -1)
  const tabLength = testcaseTabList.length
  return dataWithIndex.length !== 0 ? (
    <>
      <div className="flex h-12">
        <div
          className={cn(
            'w-48 content-center text-center',
            currentTab === 0 ? 'bg-[#222939]' : 'bg-[#121728]',
            currentTab === 1 && 'rounded-br-xl'
          )}
          onClick={() => setCurrentTab(0)}
        >
          {tabLength < 7 ? 'Testcase Result' : 'TC Res'}
        </div>
        {testcaseTabList.map((testcase, index) => {
          return (
            <div
              key={testcase.id}
              className={cn(
                'w-48 border-l border-[#222939] bg-[#121728]',
                currentTab === 0 && index == 0 && 'rounded-bl-xl',
                currentTab === testcaseTabList[index - 1]?.id &&
                  'rounded-bl-xl',
                currentTab === testcaseTabList[index + 1]?.id && 'rounded-br-xl'
              )}
            >
              <div
                key={testcase.id}
                className={cn(
                  'h-full content-center text-center',
                  currentTab === testcase.id && 'bg-[#222939]'
                )}
                onClick={() => setCurrentTab(testcase.id)}
              >
                {tabLength < 7 ? 'Samples' : 'S'} #{testcase.id}
              </div>
            </div>
          )
        })}
        <div
          className={cn(
            'flex-grow border-l border-[#222939] bg-[#121728]',
            currentTab === testcaseTabList[testcaseTabList.length - 1]?.id &&
              'rounded-bl-xl'
          )}
        />
      </div>
      <ScrollArea className="h-full">
        {currentTab === 0 ? (
          <div className="flex flex-col gap-6 p-5">
            <table className="min-w-full">
              <tbody>
                <tr>
                  <td className="py-1 text-slate-400">Correct Testcase</td>
                  <td className="py-1 text-white">
                    {acceptedConunt}/{total}
                  </td>
                </tr>
                {notAcceptedIndexes.length > 0 && (
                  <tr>
                    <td className="min-w-52 py-1 align-top text-slate-400">
                      Wrong Testcase Number
                    </td>
                    <td className="py-1 text-white">
                      {notAcceptedIndexes
                        .map((index) => `Sample #${index + 1}`)
                        .join(', ')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <TestcaseTable
              data={dataWithIndex}
              testcaseTabList={testcaseTabList}
              setTestcaseTabList={setTestcaseTabList}
              setCurrentTab={setCurrentTab}
            />
          </div>
        ) : (
          <>
            <p>{dataWithIndex[currentTab].id}</p>
            <p>{dataWithIndex[currentTab].result}</p>
          </>
        )}
      </ScrollArea>
    </>
  ) : null
}
