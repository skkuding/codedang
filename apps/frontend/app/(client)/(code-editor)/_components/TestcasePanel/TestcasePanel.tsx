'use client'

import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { cn, getResultColor } from '@/libs/utils'
import type { TestResultDetail } from '@/types/type'
import { DiffMatchPatch } from 'diff-match-patch-typescript'
import { useState, type ReactNode } from 'react'
import { IoMdClose } from 'react-icons/io'
import { WhitespaceVisualizer } from '../WhitespaceVisualizer'
import { AddUserTestcaseDialog } from './AddUserTestcaseDialog'
import { TestcaseTable } from './TestcaseTable'
import { useTestResults } from './useTestResults'

function getWidthClass(length: number) {
  if (length < 5) {
    return 'w-40'
  } else if (length < 7) {
    return 'w-28'
  } else {
    return 'w-24'
  }
}

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
            getWidthClass(testcaseTabList.length)
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
                  getWidthClass(testcaseTabList.length)
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

        <div className="flex flex-shrink-0 items-center bg-[#121728] px-2 py-2">
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
      <div className="flex flex-wrap gap-4">
        <LabeledField label="Input" text={data.input} result={data.result} />
        <LabeledField
          label="Expected Output"
          text={data.expectedOutput}
          compareText={data.output}
          result={data.result}
        />
        <LabeledField
          label="Output"
          text={data.output}
          compareText={data.expectedOutput}
          result={data.result}
        />
      </div>
    </div>
  )
}

function isErrorResult(result: string): boolean {
  return result !== 'Accepted' && result !== 'WrongAnswer'
}
interface LabeledFieldProps {
  label: string
  text: string
  compareText?: string
  result: string
}
function LabeledField({ label, text, compareText, result }: LabeledFieldProps) {
  const getColoredText = (
    text: string,
    compareText: string,
    isExpectedOutput: boolean,
    isCompileError: boolean
  ) => {
    const isNumeric = (str: string) => /^[+-]?\d+(\.\d+)?$/.test(str.trim())

    const isBothNumeric = isNumeric(text) && isNumeric(compareText)

    if (isBothNumeric) {
      const num1 = parseFloat(text)
      const num2 = parseFloat(compareText)

      let colorClass = 'text-white'

      if (num1 !== num2) {
        if (isExpectedOutput) {
          colorClass = 'text-green-500'
        } else {
          colorClass = 'text-red-500'
        }
      }

      return (
        <WhitespaceVisualizer
          text={isExpectedOutput ? compareText : text}
          className={colorClass}
        />
      )
    }
    const dmp = new DiffMatchPatch()
    const diffs = dmp.diff_main(compareText, text)
    dmp.diff_cleanupSemantic(diffs)

    return diffs.flatMap(([op, data], idx) => {
      // -1: 삭제됨 (compareText에만 있음)
      //  1: 추가됨 (text에만 있음)
      //  0: 공통된 부분
      if (isExpectedOutput && op === 1) {
        return []
      }
      if (!isExpectedOutput && op === -1) {
        return []
      }

      let colorClass = 'text-white'
      if (op === -1 && isExpectedOutput) {
        colorClass = 'text-green-500'
      } else if (op === 1 && !isExpectedOutput) {
        colorClass = 'text-red-500'
      }

      if (isCompileError) {
        // 컴파일 에러일 경우 ␣ ↵ ↹ 시각화하지 않고 색상만 적용
        return (
          <span key={idx} className={colorClass}>
            {data}
          </span>
        )
      }

      return highlightWhitespace(data, colorClass).map((el, i) => (
        <span key={`${idx}-${i}`}>{el}</span>
      ))
    })
  }
  const highlightWhitespace = (
    text: string,
    colorClass: string
  ): JSX.Element[] => {
    return [...text].map((char, i) => {
      const whitespaceStyle = {
        color: '#3581FA', // 고정된 파란색
        minWidth: '0.5em',
        display: 'inline-block'
      }

      if (char === ' ') {
        return (
          <span key={i} style={whitespaceStyle}>
            ␣
          </span>
        )
      }
      if (char === '\t') {
        return (
          <span key={i} style={whitespaceStyle}>
            ↹
          </span>
        )
      }
      if (char === '\n') {
        return (
          <span key={i} style={whitespaceStyle}>
            ↵
          </span>
        )
      }

      return (
        <span key={i} className={colorClass}>
          {char}
        </span>
      )
    })
  }

  const renderText = (
    label: string,
    text: string,
    result: string,
    compareText?: string | undefined
  ) => {
    const isCompileError = label === 'Output' && isErrorResult(result)

    // Input은 diff 없이 흰색으로만 출력
    if (label === 'Input') {
      return <WhitespaceVisualizer text={text} className="text-white" />
    }

    // Expected Output 처리
    if (label === 'Expected Output') {
      return getColoredText(compareText || '', text, true, isCompileError)
    }

    // "Output" 처리
    return getColoredText(text, compareText || '', false, isCompileError)
  }

  return (
    <div className="min-w-40 flex-1">
      <div className="flex flex-col gap-4 p-4">
        <p className="text-slate-400">{label}</p>
        <hr className="border-[#303333]/50" />
        <div className="h-fit whitespace-pre-wrap font-mono text-slate-300">
          {renderText(label, text, result, compareText)}
        </div>
      </div>
    </div>
  )
}
