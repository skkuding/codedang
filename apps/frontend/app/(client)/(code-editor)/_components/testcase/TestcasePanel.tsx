'use client'

import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { cn, getResultColor } from '@/lib/utils'
import type { TestResult, TestResultDetail } from '@/types/type'
import { useState } from 'react'
import { IoMdClose } from 'react-icons/io'
import { WhitespaceVisualizer } from '../WhitespaceVisualizer'
import AddUserTestcaseDialog from './AddUserTestcaseDialog'
import TestcaseTable from './TestcaseTable'
import { useTestResults } from './useTestResults'

export default function TestcasePanel() {
  const [testcaseTabList, setTestcaseTabList] = useState<TestResultDetail[]>([])
  const [currentTab, setCurrentTab] = useState<number>(0)

  const moveToDetailTab = (result: TestResultDetail) => {
    setTestcaseTabList((state) =>
      state
        .concat(result)
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        )
    )
    setCurrentTab(result.id)
  }

  const removeTab = (testcaseId: number) => {
    setTestcaseTabList((state) =>
      state.filter((item) => item.id !== testcaseId)
    )
    if (currentTab === testcaseId) {
      setCurrentTab(0)
    }
  }

  const testResults = useTestResults()

  return (
    <>
      <div className="flex h-12 w-full">
        <div
          className={cn(
            'w-44 flex-shrink-0 cursor-pointer content-center text-center',
            currentTab === 0 ? 'bg-[#222939]' : 'bg-[#121728]',
            testcaseTabList.length > 0 &&
              currentTab === testcaseTabList[0].id &&
              'rounded-br-xl'
          )}
          onClick={() => setCurrentTab(0)}
        >
          {testcaseTabList.length < 7 ? 'Testcase Result' : 'TC Res'}
        </div>

        <div
          className={cn(
            'flex w-[calc(100%-11rem)] gap-2 border-l border-[#222939] bg-[#121728]',
            currentTab === testcaseTabList[testcaseTabList.length - 1]?.id &&
              'rounded-bl-xl',
            currentTab === 0 && testcaseTabList.length === 0 && 'rounded-bl-xl'
          )}
        >
          <ScrollArea className="h-full w-full overflow-x-auto">
            <div className="flex h-full">
              {testcaseTabList.map((testcase, index) => (
                <TestcaseTab
                  testcaseTabList={testcaseTabList}
                  currentTab={currentTab}
                  setCurrentTab={setCurrentTab}
                  removeTab={removeTab}
                  testcaseId={testcase.id}
                  index={index}
                  key={testcase.id}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="mx-2 ml-auto">
            <AddUserTestcaseDialog />
          </div>
        </div>
      </div>

      <ScrollArea className="h-full">
        {currentTab === 0 ? (
          <div className="flex flex-col gap-6 p-5 pb-14">
            <TestSummary data={testResults} />
            <TestcaseTable
              data={testResults}
              moveToDetailTab={moveToDetailTab}
            />
          </div>
        ) : (
          <TestResultDetail data={testResults} currentTab={currentTab} />
        )}
      </ScrollArea>
    </>
  )
}

function TestcaseTab({
  testcaseTabList,
  currentTab,
  setCurrentTab,
  testcaseId,
  index,
  removeTab
}: {
  testcaseTabList: TestResult[]
  currentTab: number
  setCurrentTab: (data: number) => void
  testcaseId: number
  index: number
  removeTab: (id: number) => void
}) {
  return (
    <div
      className={cn(
        'relative h-full w-44 cursor-pointer border-l border-[#222939] bg-[#121728]',
        currentTab === 0 && index == 0 && 'rounded-bl-xl',
        currentTab === testcaseTabList[index - 1]?.id && 'rounded-bl-xl',
        currentTab === testcaseTabList[index + 1]?.id && 'rounded-br-xl'
      )}
    >
      <IoMdClose
        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-300"
        size={18}
        onClick={() => removeTab(testcaseId)}
      />
      <div
        className={cn(
          'h-full content-center pr-6 text-center',
          currentTab === testcaseId && 'bg-[#222939]'
        )}
        onClick={() => setCurrentTab(testcaseId)}
      >
        {testcaseTabList.length < 7 ? 'Samples' : 'S'} #{testcaseId}
      </div>
    </div>
  )
}

function TestSummary({ data }: { data: TestResultDetail[] }) {
  const acceptedCount = data.filter(
    (testcase) => testcase.result === 'Accepted'
  ).length

  const total = data.length

  const notAcceptedIndexes = data
    .map((testcase, index) => (testcase.result !== 'Accepted' ? index : -1))
    .filter((index) => index !== -1)

  return (
    <table className="min-w-full">
      <tbody>
        <tr>
          <td className="w-52 py-1 text-slate-400">Correct Testcase:</td>
          <td className="py-1 text-white">
            {acceptedCount}/{total}
          </td>
        </tr>
        {notAcceptedIndexes.length > 0 && (
          <tr>
            <td className="w-52 py-1 align-top text-slate-400">
              Wrong Testcase Number:
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
  )
}

function TestResultDetail({
  data,
  currentTab
}: {
  data: TestResultDetail[]
  currentTab: number
}) {
  const currentData = data.find((item) => item.id === currentTab)

  if (currentData === undefined) return null

  return (
    <div className="px-8 pt-5">
      <div className="flex w-full gap-4 rounded-md bg-[#121728] px-6 py-3 font-light text-neutral-400">
        Result
        <span className={getResultColor(currentData.result)}>
          {currentData.result}
        </span>
      </div>
      <div className="flex gap-4">
        <LabeledField label="Input" text={currentData.input} />
        <LabeledField
          label="Expected Output"
          text={currentData.expectedOutput}
        />
        <LabeledField label="Output" text={currentData.output} />
      </div>
    </div>
  )
}

function LabeledField({ label, text }: { label: string; text: string }) {
  return (
    <div className="min-w-40 flex-1">
      <div className="flex flex-col gap-4 p-4">
        <p className="text-slate-400">{label}</p>
        <hr className="border-[#303333]/50" />
        <WhitespaceVisualizer text={text} className="h-fit text-slate-300" />
      </div>
    </div>
  )
}
