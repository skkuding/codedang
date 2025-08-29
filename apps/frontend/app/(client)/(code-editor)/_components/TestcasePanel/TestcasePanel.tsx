'use client'

import { Badge } from '@/app/(client)/(main)/_components/Badge'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { cn, getResultColor } from '@/libs/utils'
import {
  useTestcaseTabStore,
  RUN_CODE_TAB,
  TESTCASE_RESULT_TAB
} from '@/stores/editorTabs'
import type { TabbedTestResult } from '@/types/type'
import { DiffMatchPatch } from 'diff-match-patch-typescript'
import { useEffect, useState, type ReactNode, type JSX } from 'react'
import { IoMdClose } from 'react-icons/io'
import { WhitespaceVisualizer } from '../WhitespaceVisualizer'
import { AddUserTestcaseDialog } from './AddUserTestcaseDialog'
import { RunnerTab } from './RunnerTab'
import { TestcaseTable } from './TestcaseTable'
import { useTestResults } from './useTestResults'

interface TestcasePanelProps {
  isContest: boolean
}

function getWidthClass(length: number) {
  if (length < 5) {
    return 'w-40'
  } else if (length < 7) {
    return 'w-28'
  } else {
    return 'w-24'
  }
}

export function TestcasePanel({ isContest }: TestcasePanelProps) {
  const [testcaseTabList, setTestcaseTabList] = useState<TabbedTestResult[]>([])
  const { activeTab, setActiveTab } = useTestcaseTabStore()
  const [detailTabId, setDetailTabId] = useState<number | null>(null)

  const moveToDetailTab = (result: TabbedTestResult) => {
    setTestcaseTabList((state) =>
      state
        .concat(result)
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.originalId === item.originalId)
        )
    )
    setDetailTabId(result.originalId)
  }

  const removeTab = (testcaseId: number) => {
    setTestcaseTabList((state) =>
      state.filter((item) => item.originalId !== testcaseId)
    )
    if (detailTabId === testcaseId) {
      setActiveTab(TESTCASE_RESULT_TAB)
      setDetailTabId(null)
    }
  }

  // Hide 'run' feature in contest, because it is not stable yet
  // TODO: remove this after 'run' feature gets stable
  useEffect(() => {
    if (isContest) {
      setActiveTab(TESTCASE_RESULT_TAB)
      setDetailTabId(null)
    }
  }, [isContest])

  const MAX_OUTPUT_LENGTH = 100000
  const testResults = useTestResults()
  const processedData = testResults.map((testcase) => ({
    ...testcase,
    output:
      testcase.output.length > MAX_OUTPUT_LENGTH
        ? testcase.output.slice(0, MAX_OUTPUT_LENGTH)
        : testcase.output
  }))
  const summaryData = processedData.map(({ id, result, type }) => ({
    id,
    result,
    type
  }))

  const currentVisibleTab = detailTabId !== null ? detailTabId : activeTab
  const currentVisibleTabIndex = testcaseTabList.findIndex(
    (tab) => tab.originalId === currentVisibleTab
  )

  return (
    <>
      <div className="flex h-12 w-full items-center overflow-x-auto">
        {!isContest && (
          <TestcaseTab
            isActive={currentVisibleTab === RUN_CODE_TAB}
            onClickTab={() => {
              setActiveTab(RUN_CODE_TAB)
              setDetailTabId(null)
            }}
            isLeftmost
            isRightOfActive={currentVisibleTab === TESTCASE_RESULT_TAB}
            className={cn(
              'h-full shrink-0 overflow-hidden text-ellipsis whitespace-nowrap',
              getWidthClass(testcaseTabList.length)
            )}
          >
            <div className="flex h-full w-full items-center justify-center gap-2">
              <span
                className={
                  'block overflow-hidden text-ellipsis whitespace-nowrap'
                }
              >
                Run Code
              </span>
              <div className="flex items-center">
                <Badge type="upcoming">
                  <div className="text-[10px]">Beta</div>
                </Badge>
              </div>
            </div>
          </TestcaseTab>
        )}
        <TestcaseTab
          isActive={currentVisibleTab === TESTCASE_RESULT_TAB}
          onClickTab={() => {
            setActiveTab(TESTCASE_RESULT_TAB)
            setDetailTabId(null)
          }}
          isLeftOfActive={currentVisibleTab === RUN_CODE_TAB}
          isRightOfActive={currentVisibleTabIndex === 0}
          className={cn(
            'h-full shrink-0 overflow-hidden text-ellipsis whitespace-nowrap',
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
        <ScrollArea className={cn('relative h-12 w-full overflow-x-auto')}>
          <div className="flex h-12">
            {testcaseTabList.map((testcase, index) => (
              <TestcaseTab
                key={testcase.originalId}
                isActive={currentVisibleTab === testcase.originalId}
                onClickTab={() => {
                  setDetailTabId(testcase.originalId)
                }}
                onClickCloseButton={() => removeTab(testcase.originalId)}
                isLeftOfActive={
                  (currentVisibleTab === TESTCASE_RESULT_TAB && index === 0) ||
                  currentVisibleTab === testcaseTabList[index - 1]?.originalId
                }
                isRightOfActive={
                  currentVisibleTab === testcaseTabList[index + 1]?.originalId
                }
                className={cn(
                  'h-12 shrink-0 overflow-hidden text-ellipsis whitespace-nowrap',
                  getWidthClass(testcaseTabList.length)
                )}
              >
                <div className="flex h-12 w-full items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap">
                  {
                    (testcaseTabList.length < 7
                      ? TAB_CONTENT
                      : SHORTHAND_TAB_CONTENT)[testcase.type]
                  }{' '}
                  #{testcase.id}
                </div>
              </TestcaseTab>
            ))}
            <span
              className={cn(
                'flex-1 border-l border-[#222939] bg-[#121728] pr-2',
                (currentVisibleTab ===
                  testcaseTabList[testcaseTabList.length - 1]?.originalId ||
                  (currentVisibleTab === TESTCASE_RESULT_TAB &&
                    testcaseTabList.length === 0)) &&
                  'rounded-bl-xl'
              )}
            />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div
          className={cn(
            'flex shrink-0 items-center bg-[#121728] px-2 py-2',
            currentVisibleTab === RUN_CODE_TAB && 'hidden'
          )}
        >
          <AddUserTestcaseDialog />
        </div>
      </div>

      <RunnerTab
        className={cn(currentVisibleTab === RUN_CODE_TAB ? 'block' : 'hidden')}
      />
      <ScrollArea className="h-full">
        {currentVisibleTab === TESTCASE_RESULT_TAB ? (
          <div className="flex flex-col gap-6 p-5 pb-14">
            <TestSummary data={summaryData} />
            <TestcaseTable
              data={processedData}
              moveToDetailTab={moveToDetailTab}
            />
          </div>
        ) : (
          <TestResultDetail
            data={processedData.find(
              (item) => item.originalId === currentVisibleTab
            )}
          />
        )}
      </ScrollArea>
    </>
  )
}

export const TAB_CONTENT = {
  sample: 'Sample',
  user: 'User',
  hidden: 'Hidden'
}

const SHORTHAND_TAB_CONTENT = {
  sample: 'S',
  user: 'U',
  hidden: 'H'
}

interface TestcaseTabProps {
  isActive: boolean
  onClickTab: () => void
  onClickCloseButton?: () => void
  className?: string
  children: ReactNode
  isLeftmost?: boolean
  isLeftOfActive?: boolean
  isRightOfActive?: boolean
}

function TestcaseTab({
  isActive,
  onClickTab,
  onClickCloseButton,
  className,
  children,
  isLeftmost,
  isLeftOfActive,
  isRightOfActive
}: TestcaseTabProps) {
  return (
    <button
      type="button"
      className={cn(
        'relative h-12 border-l border-[#222939] bg-[#121728]',
        !isLeftmost && 'border-l',
        isActive ? 'bg-[#222939]' : 'bg-[#121728]',
        isLeftOfActive && 'rounded-bl-xl',
        isRightOfActive && 'rounded-br-xl',
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
  data: { id: number; result: string; type: 'user' | 'sample' | 'hidden' }[]
}) {
  const acceptedCount = data.filter(
    (testcase) => testcase.result === 'Accepted'
  ).length

  const total = data.length

  const notAcceptedTestcases = data
    .map((testcase) =>
      testcase.result !== 'Accepted' && testcase.result !== 'Judging'
        ? `${TAB_CONTENT[testcase.type]} #${testcase.id}`
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

function TestResultDetail({ data }: { data: TabbedTestResult | undefined }) {
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
    isError: boolean
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

      if (isError) {
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
    const isError = label === 'Output' && isErrorResult(result)

    // Input은 diff 없이 흰색으로만 출력

    if (label === 'Input') {
      return <WhitespaceVisualizer text={text} className="text-white" />
    }

    // Expected Output 처리

    if (label === 'Expected Output') {
      return getColoredText(compareText || '', text, true, isError)
    }

    // "Output" 처리

    return getColoredText(text, compareText || '', false, isError)
  }

  return (
    <div className="min-w-40 flex-1">
      <div className="flex flex-col gap-4 p-4">
        <p className="text-slate-400">{label}</p>
        <hr className="border-[#303333]/50" />
        <div className="h-fit whitespace-pre-wrap break-words font-mono text-slate-300">
          {renderText(label, text, result, compareText)}
        </div>
      </div>
    </div>
  )
}
