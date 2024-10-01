'use client'

import { cn } from '@/lib/utils'
import type { TestcaseResult } from '@/types/type'
import { sanitize } from 'isomorphic-dompurify'
import { useState } from 'react'
import { IoMdClose } from 'react-icons/io'
import TestcaseTable from './TestcaseTable'
import { ScrollArea } from './ui/scroll-area'

interface TestcasePanelProps {
  testResult: TestcaseResult[]
}

export default function TestcasePanel({ testResult }: TestcasePanelProps) {
  const [testcaseTabList, setTestcaseTabList] = useState<TestcaseResult[]>([])
  const [currentTab, setCurrentTab] = useState<number>(0)
  const acceptedCount = testResult.filter(
    (testcase) => testcase.result === 'Accepted'
  ).length
  const total = testResult.length
  const dataWithIndex = testResult.map((testcase, index) => ({
    ...testcase,
    id: index + 1
  }))
  const notAcceptedIndexes = dataWithIndex
    .map((testcase, index) => (testcase.result !== 'Accepted' ? index : -1))
    .filter((index) => index !== -1)
  const tabLength = testcaseTabList.length

  function handleDelete(testcase: TestcaseResult) {
    const updatedList = testcaseTabList.filter(
      (item) => item.id !== testcase.id
    )
    setTestcaseTabList(updatedList)
    if (currentTab === testcase.id) {
      setCurrentTab(0)
    }
  }

  return dataWithIndex.length !== 0 ? (
    <>
      <div className="flex h-12">
        <div
          className={cn(
            'w-44 content-center text-center',
            currentTab === 0 ? 'bg-[#222939]' : 'bg-[#121728]',
            currentTab === testcaseTabList[0].id && 'rounded-br-xl'
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
                'relative w-44 border-l border-[#222939] bg-[#121728]',
                currentTab === 0 && index == 0 && 'rounded-bl-xl',
                currentTab === testcaseTabList[index - 1]?.id &&
                  'rounded-bl-xl',
                currentTab === testcaseTabList[index + 1]?.id && 'rounded-br-xl'
              )}
            >
              <IoMdClose
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-300"
                size={18}
                onClick={() => handleDelete(testcase)}
              />
              <div
                key={testcase.id}
                className={cn(
                  'h-full content-center pr-6 text-center',
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
              'rounded-bl-xl',
            currentTab === 0 && tabLength === 0 && 'rounded-bl-xl'
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
                    {acceptedCount}/{total}
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
          <div className="px-8 pt-5">
            <div className="flex w-full gap-4 rounded-md bg-[#121728] px-6 py-3 font-light text-neutral-400">
              Result
              <span
                className={cn(
                  dataWithIndex[currentTab - 1].result === 'Accepted'
                    ? 'text-green-500'
                    : dataWithIndex[currentTab - 1].result === 'Judging'
                      ? 'text-neutral-400'
                      : 'text-red-500'
                )}
              >
                {dataWithIndex[currentTab - 1].result}
              </span>
            </div>
            <div className="flex gap-4">
              <LabeledField
                label="Input"
                text={dataWithIndex[currentTab - 1].input}
              />
              <LabeledField
                label="Expected Output"
                text={dataWithIndex[currentTab - 1].output}
              />
            </div>
          </div>
        )}
      </ScrollArea>
    </>
  ) : null
}

function LabeledField({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex min-w-96 flex-col gap-4 p-4">
      <p className="text-slate-400">{label}</p>
      <hr className="border-[#303333]/50" />
      <pre
        className="prose prose-invert max-w-full text-sm leading-relaxed text-slate-300"
        dangerouslySetInnerHTML={{
          __html: sanitize(text)
        }}
      />
    </div>
  )
}
