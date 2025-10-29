'use client'

import { CodeEditor } from '@/components/CodeEditor'
import { Button } from '@/components/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/shadcn/resizable'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { Skeleton } from '@/components/shadcn/skeleton'
import { GET_ASSIGNMENT_SCORE_SUMMARIES } from '@/graphql/assignment/queries'
import { GET_PROBLEM_TESTCASE_WITHOUT_IO } from '@/graphql/problem/queries'
import { GET_ASSIGNMENT_LATEST_SUBMISSION } from '@/graphql/submission/queries'
import { cn, safeFetcherWithAuth } from '@/libs/utils'
import checkIcon from '@/public/icons/check-green.svg'
import { useTestcaseStore } from '@/stores/testcaseStore'
import type { Language } from '@/types/type'
import { useQuery, useSuspenseQuery } from '@apollo/client'
import type { TestCaseResult } from '@generated/graphql'
import { ErrorBoundary, Suspense } from '@suspensive/react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { BiSolidUser } from 'react-icons/bi'
import { FaSortDown } from 'react-icons/fa'
import { TestcasePanel } from './TestcasePanel'
import { mapTestResults } from './libs/util'

export function EditorMainResizablePanelFallback() {
  return (
    <div className="h-dvh w-full bg-slate-800 text-white">
      <div className="flex h-12 w-full items-center justify-between border-b border-slate-700 bg-[#222939] px-3">
        <Skeleton className="h-6 w-48 rounded-lg bg-slate-700" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-lg bg-slate-700" />
          <Skeleton className="h-8 w-20 rounded-lg bg-slate-700" />
        </div>
      </div>
      <div className="flex-1 bg-[#222939]">
        <ScrollArea className="h-full">
          <Skeleton className="m-6 h-[400px] w-full rounded-lg bg-slate-700" />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </div>
  )
}

interface ProblemEditorProps {
  children: React.ReactNode
}

export function EditorMainResizablePanel({ children }: ProblemEditorProps) {
  const params = useParams<{
    courseId: string
    assignmentId: string
    userId: string
    problemId: string
  }>()
  const { courseId, assignmentId, userId, problemId } = params
  const [isTesting, setIsTesting] = useState(false)

  const lastSubmission = useQuery(GET_ASSIGNMENT_LATEST_SUBMISSION, {
    variables: {
      groupId: Number(courseId),
      assignmentId: Number(assignmentId),
      userId: Number(userId),
      problemId: Number(problemId)
    },
    fetchPolicy: 'cache-first'
  }).data?.getAssignmentLatestSubmission

  const testcaseData = useSuspenseQuery(GET_PROBLEM_TESTCASE_WITHOUT_IO, {
    variables: {
      id: Number(problemId)
    },
    fetchPolicy: 'cache-first'
  }).data.getProblem.testcase

  const summaries =
    useSuspenseQuery(GET_ASSIGNMENT_SCORE_SUMMARIES, {
      variables: {
        groupId: Number(courseId),
        assignmentId: Number(assignmentId),
        take: 1000
      }
    }).data?.getAssignmentScoreSummaries ?? []
  const { setIsTestResult } = useTestcaseStore()

  const [testResults, setTestResults] = useState<
    (Omit<TestCaseResult, 'problemTestcase'> & {
      expectedOutput: string
      order: number
      input: string
    })[]
  >([])

  const handleReset = () => {
    setEditorCode(initialCode)
    setTestResults([])
    setIsTestResult(false)
  }

  const language = lastSubmission?.language ?? 'C'
  const currentMember = summaries.find(
    (member) => member.userId === Number(userId)
  )

  const currentIndex = summaries.findIndex((s) => s.userId === Number(userId))
  const prevIndex = (currentIndex - 1 + summaries.length) % summaries.length
  const nextIndex = (currentIndex + 1) % summaries.length

  const prevUserId = summaries[prevIndex]?.userId
  const nextUserId = summaries[nextIndex]?.userId

  // 첫 번째와 마지막 학생인지 확인
  const isFirstStudent = currentIndex === 0

  const isLastStudent = currentIndex === summaries.length - 1

  const [editorCode, setEditorCode] = useState('')
  const [initialCode, setInitialCode] = useState('')
  useEffect(() => {
    if (lastSubmission) {
      setEditorCode(lastSubmission.code)
      setInitialCode(lastSubmission.code)
      const mappedResults = mapTestResults(
        testcaseData,
        lastSubmission.testcaseResult
      )
      setTestResults(mappedResults)
    }
  }, [lastSubmission])
  const handleTest = useCallback(async () => {
    setIsTesting(true)

    try {
      await submitCodeForTesting(problemId, language, editorCode)

      const finalResult = await pollTestResults(problemId)

      if (finalResult) {
        const mappedResults = mapTestResults(
          testcaseData,
          finalResult.map((result) => ({
            ...result,
            problemTestcaseId: result.id
          }))
        )
        setTestResults(mappedResults)
      } else {
        setTestResults([])
      }
    } catch {
      setTestResults([])
    } finally {
      setIsTesting(false)
      setIsTestResult(true)
    }
  }, [language, editorCode, problemId, testcaseData])

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="border border-slate-700"
    >
      <ResizablePanel
        defaultSize={35}
        style={{ minWidth: '500px' }}
        minSize={20}
      >
        <div className="grid-rows-editor grid h-full grid-cols-1">
          <div className="flex h-12 w-full items-center justify-between border-b border-slate-700 bg-[#222939] px-3">
            <div className="flex gap-2">
              <BiSolidUser className="size-6 rounded-none text-gray-300" />
              <DropdownMenu>
                <DropdownMenuTrigger className="flex gap-1 text-lg text-white outline-none">
                  <h1>
                    {currentMember?.realName}({currentMember?.studentId})
                  </h1>
                  <FaSortDown />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-[400px] overflow-y-auto border-slate-700 bg-slate-900">
                  {summaries.map((summary) => (
                    <Link
                      href={
                        `/admin/course/${courseId}/assignment/${assignmentId}/assessment/user/${summary.userId}/problem/${problemId}` as const
                      }
                      key={summary.userId}
                    >
                      <DropdownMenuItem
                        className={cn(
                          'flex justify-between text-white hover:cursor-pointer focus:bg-slate-800 focus:text-white',
                          currentMember?.userId === summary.userId &&
                            'text-primary-light focus:text-primary-light'
                        )}
                      >
                        {summary.realName}({summary.studentId})
                        {summary.problemScores.some(
                          (score) =>
                            score.problemId === Number(problemId) &&
                            score.finalScore !== null
                        ) && (
                          <div className="flex items-center justify-center pl-2">
                            <Image
                              src={checkIcon}
                              alt="check"
                              width={16}
                              height={16}
                            />
                          </div>
                        )}
                      </DropdownMenuItem>
                    </Link>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex gap-2">
              <Link
                href={
                  `/admin/course/${courseId}/assignment/${assignmentId}/assessment/user/${prevUserId}/problem/${problemId}` as const
                }
                className={cn(isFirstStudent && 'pointer-events-none')}
              >
                <Button
                  size={'sm'}
                  variant={'outline'}
                  disabled={isFirstStudent || summaries.length <= 1}
                >
                  Previous
                </Button>
              </Link>

              <Link
                href={
                  `/admin/course/${courseId}/assignment/${assignmentId}/assessment/user/${nextUserId}/problem/${problemId}` as const
                }
                className={cn(isLastStudent && 'pointer-events-none')}
              >
                <Button
                  size={'sm'}
                  disabled={isLastStudent || summaries.length <= 1}
                >
                  Next
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 bg-[#222939]">
            <ScrollArea className="h-full">
              {children}

              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle className="border-[0.5px] border-slate-700" />
      <ResizablePanel defaultSize={65} className="bg-[#222939]">
        <div className="flex h-full flex-col">
          <div className="flex h-12 items-center gap-2 border-b border-slate-700 bg-[#222939] px-6">
            <div className="flex-1" />
            <button
              onClick={handleReset}
              className="rounded bg-gray-500 px-3 py-1 text-white hover:bg-gray-600"
            >
              Reset
            </button>
            <button
              onClick={handleTest}
              disabled={isTesting}
              className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
            >
              {isTesting ? 'Testing...' : 'Test'}
            </button>
          </div>

          <ResizablePanelGroup direction="vertical" className="flex-1">
            <ResizablePanel defaultSize={60} className="relative">
              <CodeEditor
                value={editorCode}
                language={language as Language}
                readOnly={false}
                enableCopyPaste={true}
                height="100%"
                className="h-full"
                onChange={setEditorCode}
              />
            </ResizablePanel>
            <ResizableHandle className="border-[0.5px] border-slate-700" />
            <ResizablePanel defaultSize={40} minSize={20}>
              <Suspense
                fallback={
                  <Skeleton className="h-20 w-full rounded-lg bg-slate-900" />
                }
              >
                <ErrorBoundary
                  fallback={<div>Error occurred in Testcase Panel</div>}
                >
                  <TestcasePanel
                    testResults={testResults}
                    isTesting={isTesting}
                  />
                </ErrorBoundary>
              </Suspense>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

async function submitCodeForTesting(
  problemId: string,
  language: string,
  code: string
) {
  await safeFetcherWithAuth.post('submission/test', {
    json: {
      language,
      code: [
        {
          id: 1,
          text: code,
          locked: false
        }
      ]
    },
    searchParams: {
      problemId
    }
  })
}

async function pollTestResults(problemId: string) {
  let attempts = 0
  const maxAttempts = 10
  const interval = 2000

  while (attempts < maxAttempts) {
    const pollData = await safeFetcherWithAuth
      .get('submission/test', {
        searchParams: {
          problemId
        }
      })
      .json()

    if (
      Array.isArray(pollData) &&
      pollData.every((r) => r.result !== 'Judging')
    ) {
      return pollData
    }

    await new Promise((resolve) => setTimeout(resolve, interval))
    attempts++
  }

  return null
}
