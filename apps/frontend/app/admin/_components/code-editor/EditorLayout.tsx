'use client'

import { HeaderAuthPanel } from '@/components/auth/HeaderAuthPanel'
import { GET_ASSIGNMENT } from '@/graphql/assignment/queries'
import { GET_PROBLEM_TESTCASE } from '@/graphql/problem/queries'
import { GET_ASSIGNMENT_LATEST_SUBMISSION } from '@/graphql/submission/queries'
import { baseUrl } from '@/libs/constants'
import { safeFetcherWithAuth } from '@/libs/utils'
import codedangLogo from '@/public/logos/codedang-editor.svg'
import type { TestResultDetail } from '@/types/type'
import { useQuery, useSuspenseQuery, useLazyQuery } from '@apollo/client'
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
  const assignment = useSuspenseQuery(GET_ASSIGNMENT, {
    variables: {
      groupId: courseId,
      assignmentId
    }
  }).data.getAssignment

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

  useEffect(() => {
    if (submissionData?.code) {
      setEditorCode(submissionData.code)
      setInitialCode(submissionData.code)
    }
  }, [submissionData])

  const handleReset = useCallback(() => {
    setEditorCode(initialCode)
    setTestResults([])
  }, [initialCode])

  const handleTest = useCallback(async () => {
    setIsTesting(true)
    setTestResults([])
    try {
      const { data: testcaseResult } = await fetchTestcase()

      await submitCodeForTesting(problemId, language, editorCode)

      const finalResult = await pollTestResults(problemId)

      if (finalResult) {
        const testcases = testcaseResult?.getProblem?.testcase || []
        const resultMap = new Map(finalResult.map((r) => [Number(r.id), r]))
        const mappedResults = testcases.map((testcase, idx) => {
          const testResult = resultMap.get(Number(testcase.id))
          return {
            id: Number(testcase.id),
            order: idx + 1,
            type: testcase.isHidden ? ('hidden' as const) : ('sample' as const),
            input: testcase.input ?? '',
            expectedOutput: testcase.output ?? '',
            output: testResult?.output ?? '',
            result: testResult?.result ?? ''
          }
        })
        setTestResults(mappedResults)
      } else {
        setTestResults([])
      }
    } catch {
      setTestResults([])
    } finally {
      setIsTesting(false)
    }
  }, [language, editorCode, problemId, fetchTestcase])

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
            {assignment.title}
          </Link>
          <div className="flex items-center gap-1 font-medium">
            <p className="mx-2"> / </p>
            <AssignmentProblemDropdown
              problemId={problemId}
              assignmentId={assignmentId}
              courseId={courseId}
              userId={userId}
              isSubmitted={submissionData !== undefined}
            />
          </div>
        </div>
        <HeaderAuthPanel session={session} group="editor" />
      </header>
      <EditorMainResizablePanel
        language={language}
        code={editorCode}
        courseId={courseId}
        userId={userId}
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
