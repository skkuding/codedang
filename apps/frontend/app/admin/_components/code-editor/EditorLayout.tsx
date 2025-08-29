'use client'

import { HeaderAuthPanel } from '@/components/auth/HeaderAuthPanel'
import { GET_ASSIGNMENT } from '@/graphql/assignment/queries'
import { GET_PROBLEM_TESTCASE } from '@/graphql/problem/queries'
import { GET_ASSIGNMENT_LATEST_SUBMISSION } from '@/graphql/submission/queries'
import { safeFetcherWithAuth } from '@/libs/utils'
import codedangLogo from '@/public/logos/codedang-editor.svg'
import type { TestResultDetail } from '@/types/type'
import { useQuery, useLazyQuery } from '@apollo/client'
import type { ProblemTestcase, TestCaseResult } from '@generated/graphql'
import type { Session } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useState, useEffect } from 'react'
import { AssignmentProblemDropdown } from './AssignmentProblemDropdown'
import { EditorMainResizablePanel } from './EditorResizablePanel'

async function submitCodeForTesting(
  problemId: number,
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

async function pollTestResults(problemId: number) {
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

function mapTestResults(
  testcases: ProblemTestcase[],
  results: TestCaseResult[]
) {
  const resultMap = new Map(
    results.map((r) => [Number(r.problemTestcaseId), r])
  )
  let sampleCount = 0
  let hiddenCount = 0
  console.log(testcases)
  console.log(results)
  console.log(resultMap)
  return testcases.map((testcase) => {
    const testResult = resultMap.get(Number(testcase.id))
    if (testcase.isHidden) {
      hiddenCount++
    } else {
      sampleCount++
    }
    return {
      id: Number(testcase.id),
      order: testcase.isHidden ? hiddenCount : sampleCount,
      type: testcase.isHidden ? ('hidden' as const) : ('sample' as const),
      input: testcase.input ?? '',
      expectedOutput: testcase.output ?? '',
      output: testResult?.output ?? '',
      result: testResult?.result ?? '',
      isUserTestcase: false
    }
  })
}

interface EditorLayoutProps {
  courseId: number
  assignmentId: number
  problemId: number
  userId: number
  session: Session | null
  children: React.ReactNode
}

export function EditorLayout({
  courseId,
  assignmentId,
  problemId,
  userId,
  session,
  children
}: EditorLayoutProps) {
  const { data: assignmentData, loading: assignmentLoading } = useQuery(
    GET_ASSIGNMENT,
    {
      variables: {
        groupId: courseId,
        assignmentId
      }
    }
  )

  const { data } = useQuery(GET_ASSIGNMENT_LATEST_SUBMISSION, {
    variables: {
      groupId: courseId,
      assignmentId,
      userId,
      problemId
    }
  })

  const [fetchTestcase, { data: testcaseData }] = useLazyQuery(
    GET_PROBLEM_TESTCASE,
    {
      variables: {
        id: problemId
      }
    }
  )

  const submissionData = data ? data?.getAssignmentLatestSubmission : null

  const language = submissionData?.language ?? 'C'
  const [editorCode, setEditorCode] = useState('')
  const [initialCode, setInitialCode] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResultDetail[]>([])

  const initializeTestResults = useCallback(() => {
    if (submissionData?.testcaseResult && testcaseData?.getProblem?.testcase) {
      const mappedResults = mapTestResults(
        testcaseData.getProblem.testcase as ProblemTestcase[],
        submissionData.testcaseResult as TestCaseResult[]
      )
      setTestResults(mappedResults)
    } else {
      setTestResults([])
    }
  }, [submissionData, testcaseData])

  useEffect(() => {
    if (submissionData) {
      setEditorCode(submissionData.code)
      setInitialCode(submissionData.code)
      if (submissionData.testcaseResult) {
        fetchTestcase()
      }
    }
  }, [submissionData, fetchTestcase])

  useEffect(() => {
    initializeTestResults()
  }, [initializeTestResults])

  const handleReset = useCallback(() => {
    setEditorCode(initialCode)
    initializeTestResults()
  }, [initialCode, initializeTestResults])

  const handleTest = useCallback(async () => {
    setIsTesting(true)
    try {
      await submitCodeForTesting(problemId, language, editorCode)

      const finalResult = await pollTestResults(problemId)

      if (finalResult) {
        const mappedResults = mapTestResults(
          testcaseData?.getProblem?.testcase as ProblemTestcase[],
          finalResult.map((result) => ({
            ...result,
            problemTestcaseId: result.id
          })) as TestCaseResult[]
        )
        setTestResults(mappedResults)
      } else {
        setTestResults([])
      }
    } catch {
      setTestResults([])
    } finally {
      setIsTesting(false)
    }
  }, [language, editorCode, problemId, testcaseData])

  if (assignmentLoading) {
    return (
      <div className="fixed left-0 top-0 grid h-dvh w-full place-items-center bg-slate-800 text-white">
        Loading Editor...
      </div>
    )
  }

  const assignment = assignmentData?.getAssignment

  return (
    // Admin Layout의 Sidebar를 무시하기 위한 fixed
    <div className="grid-rows-editor fixed left-0 top-0 grid h-dvh w-full min-w-[1000px] overflow-x-auto bg-slate-800 text-white">
      <header className="flex h-12 justify-between bg-slate-900 px-6">
        <div className="flex items-center justify-center gap-4 text-lg text-[#787E80]">
          <Link href="/">
            <Image src={codedangLogo} alt="코드당" width={33} />
          </Link>
          <Link
            href={
              `/admin/course/${courseId}/assignment/${assignmentId}` as const
            }
          >
            {assignment?.title}
          </Link>
          <div className="flex items-center gap-1 font-medium">
            <p className="mx-2"> / </p>
            <AssignmentProblemDropdown
              problemId={problemId}
              assignmentId={assignmentId}
              courseId={courseId}
              userId={userId}
            />
          </div>
        </div>
        <HeaderAuthPanel session={session} group="editor" />
      </header>
      <EditorMainResizablePanel
        language={language}
        code={editorCode}
        courseId={courseId}
        assignmentId={assignmentId}
        userId={userId}
        problemId={problemId}
        setEditorCode={setEditorCode}
        isTesting={isTesting}
        onTest={handleTest}
        testResults={testResults}
        testcases={(testcaseData?.getProblem?.testcase || []).map((tc) => ({
          id: Number(tc.id),
          input: tc.input ?? '',
          output: tc.output ?? '',
          isHidden: tc.isHidden ?? 'sample'
        }))}
        onReset={handleReset}
      >
        {children}
      </EditorMainResizablePanel>
    </div>
  )
}
