'use client'

import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { cn, getResultColor } from '@/libs/utils'
import type { TestResultDetail } from '@/types/type'
import { DiffMatchPatch } from 'diff-match-patch-typescript'
import { useState, type ReactNode } from 'react'
import { IoMdClose } from 'react-icons/io'
import { AddUserTestcaseDialog } from './AddUserTestcaseDialog'
import { TestcaseTable } from './TestcaseTable'
import { useTestResults } from './useTestResults'

export function TestcasePanel() {
  const [testcaseTabList, setTestcaseTabList] = useState<TestResultDetail[]>([])
  const [currentTab, setCurrentTab] = useState<number>(0)

  const moveToDetailTab = (result: TestResultDetail) => {
    setTestcaseTabList((state) =>
      state
        .concat(result)
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.originalId === item.originalId)
        )
    )
    setCurrentTab(result.originalId)
  }

  const removeTab = (testcaseId: number) => {
    setTestcaseTabList((state) =>
      state.filter((item) => item.originalId !== testcaseId)
    )
    if (currentTab === testcaseId) {
      setCurrentTab(0)
    }
  }

  const MAX_OUTPUT_LENGTH = 100000
  const testResults = useTestResults()
  const processedData = testResults.map((testcase) => ({
    ...testcase,
    output:
      testcase.output.length > MAX_OUTPUT_LENGTH
        ? testcase.output.slice(0, MAX_OUTPUT_LENGTH)
        : testcase.output
  }))
  const summaryData = processedData.map(({ id, result, isUserTestcase }) => ({
    id,
    result,
    isUserTestcase
  }))

  return (
    <>
      <div className="flex h-12 w-full items-center overflow-x-auto">
        <TestcaseTab
          currentTab={currentTab}
          onClickTab={() => setCurrentTab(0)}
          nextTab={testcaseTabList[0]?.originalId}
          className={cn(
            'h-full flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap',
            (() => {
              let widthClass = ''
              if (testcaseTabList.length < 5) {
                widthClass = 'w-44' //기본 너비
              } else if (testcaseTabList.length < 7) {
                widthClass = 'w-28' //좁은 너비
              } else {
                widthClass = 'w-24' //짧은 너비
              }
              return widthClass
            })()
          )}
        >
          <div className="flex h-full w-full items-center justify-center">
            <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
              {(() => {
                if (testcaseTabList.length < 7) {
                  return 'Testcase Result'
                } else {
                  return 'TC Res'
                }
              })()}
            </span>
          </div>
        </TestcaseTab>

        <ScrollArea
          className={cn(
            'relative h-12 w-full overflow-x-auto',
            currentTab === 0 && 'rounded-bl-xl'
          )}
        >
          <div className="flex h-12">
            {testcaseTabList.map((testcase, index) => (
              <TestcaseTab
                currentTab={currentTab}
                prevTab={testcaseTabList[index - 1]?.originalId}
                nextTab={testcaseTabList[index + 1]?.originalId}
                onClickTab={() => setCurrentTab(testcase.originalId)}
                onClickCloseButton={() => removeTab(testcase.originalId)}
                testcaseId={testcase.originalId}
                key={testcase.originalId}
                className={cn(
                  'h-12 flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap', // 높이, 말줄임 처리
                  (() => {
                    let widthClass = ''
                    if (testcaseTabList.length < 5) {
                      widthClass = 'w-44'
                    } else if (testcaseTabList.length < 7) {
                      widthClass = 'w-28'
                    } else {
                      widthClass = 'w-24'
                    }
                    return widthClass
                  })()
                )}
              >
                <div className="flex h-12 w-full items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap">
                  {
                    (testcaseTabList.length < 7
                      ? TAB_CONTENT
                      : SHORTHAND_TAB_CONTENT)[
                      testcase.isUserTestcase ? 'user' : 'sample'
                    ]
                  }{' '}
                  #{testcase.id}
                </div>
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
            <TestSummary data={summaryData} />
            <TestcaseTable
              data={processedData}
              moveToDetailTab={moveToDetailTab}
            />
          </div>
        ) : (
          <TestResultDetail
            data={processedData.find((item) => item.originalId === currentTab)}
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
        'relative h-12 w-44 border-l border-[#222939] bg-[#121728]',
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

function TestSummary({
  data
}: {
  data: { id: number; result: string; isUserTestcase: boolean }[]
}) {
  const acceptedCount = data.filter(
    (testcase) => testcase.result === 'Accepted'
  ).length

  const total = data.length

  const notAcceptedTestcases = data
    .map((testcase) =>
      testcase.result !== 'Accepted' && testcase.result !== 'Judging'
        ? `${testcase.isUserTestcase ? 'User' : 'Sample'} #${testcase.id}`
        : undefined
    )
    .filter(Boolean)

  return (
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
  )
}

function TestResultDetail({ data }: { data: TestResultDetail | undefined }) {
  if (data === undefined) {
    return null
  }

  return (
    <div className="px-8 pt-5">
      <div className="flex w-full gap-4 rounded-md bg-[#121728] px-6 py-3 font-light text-neutral-400">
        Result
        <span className={getResultColor(data.result)}>{data.result}</span>
      </div>
      <div className="flex gap-4">
        <LabeledField label="Input" text={data.input} />
        <LabeledField
          label="Expected Output"
          text={data.expectedOutput}
          compareText={data.output}
        />
        <LabeledField
          label="Output"
          text={data.output}
          compareText={data.expectedOutput}
        />
      </div>
    </div>
  )
}

interface LabeledFieldProps {
  label: string
  text: string
  compareText?: string
}
function LabeledField({ label, text, compareText }: LabeledFieldProps) {
  const getColoredText = (
    text: string,
    compareText: string,
    isExpectedOutput: boolean
  ) => {
    const dmp = new DiffMatchPatch()
    const diffs = dmp.diff_main(compareText, text)
    dmp.diff_cleanupSemantic(diffs)

    return diffs.map(([op, data], idx) => {
      if (op === 0) {
        // 동일한 텍스트는 흰색으로 표시
        return (
          <span key={idx} className="text-white">
            {data}
          </span>
        )
      } else if (op === -1 && isExpectedOutput) {
        // Expected Output에만 있는 텍스트는 초록색으로 표시
        return (
          <span key={idx} className="text-green-500">
            {data}
          </span>
        )
      } else if (op === 1 && !isExpectedOutput) {
        // Output에만 있는 텍스트는 빨간색으로 표시
        return (
          <span key={idx} className="text-red-500">
            {data}
          </span>
        )
      }
      return null
    })
  }

  const renderText = (label: string, text: string, compareText?: string) => {
    // Input 값은 항상 흰색으로 출력
    if (label === 'Input') {
      return <span className="text-white">{text}</span>
    }

    // Expected Output 처리
    if (label === 'Expected Output') {
      return getColoredText(compareText || '', text, true)
    }

    // "Output" 처리
    return getColoredText(text, compareText || '', false)
  }

  return (
    <div className="min-w-40 flex-1">
      <div className="flex flex-col gap-4 p-4">
        <p className="text-slate-400">{label}</p>
        <hr className="border-[#303333]/50" />
        <div className="h-fit text-slate-300">
          {renderText(label, text, compareText)}
        </div>
      </div>
    </div>
  )
}
