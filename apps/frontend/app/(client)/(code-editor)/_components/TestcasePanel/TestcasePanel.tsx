'use client'

import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { cn, getResultColor } from '@/lib/utils'
import type { TestResultDetail } from '@/types/type'
import { useState, type ReactNode } from 'react'
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
        <TestcaseTab
          currentTab={currentTab}
          onClickTab={() => setCurrentTab(0)}
          nextTab={testcaseTabList[0]?.id}
          className="flex-shrink-0"
        >
          {testcaseTabList.length < 7 ? 'Testcase Result' : 'TC Res'}
        </TestcaseTab>

        <ScrollArea
          className={cn(
            'relative h-full w-full overflow-x-auto',
            currentTab === 0 && 'rounded-bl-xl'
          )}
        >
          <div className="flex h-full">
            {testcaseTabList.map((testcase, index) => (
              <TestcaseTab
                currentTab={currentTab}
                prevTab={testcaseTabList[index - 1]?.id}
                nextTab={testcaseTabList[index + 1]?.id}
                onClickTab={() => setCurrentTab(testcase.id)}
                onClickCloseButton={() => removeTab(testcase.id)}
                testcaseId={testcase.id}
                key={testcase.id}
              >
                {
                  (testcaseTabList.length < 7
                    ? TAB_CONTENT
                    : SHORTHAND_TAB_CONTENT)[
                    testcase.isUserTestcase ? 'user' : 'sample'
                  ]
                }{' '}
                #{testcase.id}
              </TestcaseTab>
            ))}
            <span
              className={cn(
                'flex-1 border-l border-[#222939] bg-[#121728] pr-2',
                currentTab ===
                  testcaseTabList[testcaseTabList.length - 1]?.id &&
                  'rounded-bl-xl'
              )}
            />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="flex flex-shrink-0 items-center bg-[#121728] px-2">
          <AddUserTestcaseDialog />
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
          <TestResultDetail
            data={testResults.find((item) => item.id === currentTab)}
          />
        )}
      </ScrollArea>
    </>
  )
}

const TAB_CONTENT = {
  sample: 'Sample',
  user: 'User'
}

const SHORTHAND_TAB_CONTENT = {
  sample: 'S',
  user: 'U'
}

function TestcaseTab({
  prevTab,
  nextTab,
  currentTab,
  testcaseId = 0,
  className,
  onClickTab,
  onClickCloseButton,
  children
}: {
  prevTab?: number
  nextTab?: number
  currentTab: number
  testcaseId?: number
  onClickTab: () => void
  onClickCloseButton?: () => void
  className?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className={cn(
        'relative h-full w-44 border-l border-[#222939] bg-[#121728]',
        currentTab === testcaseId && 'bg-[#222939]',
        currentTab === prevTab && 'rounded-bl-xl',
        currentTab === nextTab && 'rounded-br-xl',
        className
      )}
      onClick={onClickTab}
    >
      {onClickCloseButton && (
        <IoMdClose
          className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-300"
          size={18}
          onClick={(e) => {
            e.stopPropagation()
            onClickCloseButton()
          }}
        />
      )}
      <div
        className={cn(
          'h-full content-center text-center',
          onClickCloseButton && 'pr-6'
        )}
      >
        {children}
      </div>
    </button>
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

function TestResultDetail({ data }: { data: TestResultDetail | undefined }) {
  if (data === undefined) return null

  return (
    <div className="px-8 pt-5">
      <div className="flex w-full gap-4 rounded-md bg-[#121728] px-6 py-3 font-light text-neutral-400">
        Result
        <span className={getResultColor(data.result)}>{data.result}</span>
      </div>
      <div className="flex gap-4">
        <LabeledField label="Input" text={data.input} />
        <LabeledField label="Expected Output" text={data.expectedOutput} />
        <LabeledField label="Output" text={data.output} />
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
