'use client'

import { HeaderAuthPanel } from '@/components/auth/HeaderAuthPanel'
import { GET_ASSIGNMENT } from '@/graphql/assignment/queries'
import { GET_PROBLEM_TESTCASE } from '@/graphql/problem/queries'
import { GET_ASSIGNMENT_LATEST_SUBMISSION } from '@/graphql/submission/queries'
import { baseUrl } from '@/libs/constants'
import codedangLogo from '@/public/logos/codedang-editor.svg'
import { useQuery, useSuspenseQuery, useLazyQuery } from '@apollo/client'
import type { Session } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useState, useEffect } from 'react'
import { AssignmentProblemDropdown } from './AssignmentProblemDropdown'
import { EditorMainResizablePanel } from './EditorResizablePanel'

interface TestResultDetail {
  id: number
  input: string
  expectedOutput: string
  output: string
  result: string
  isUserTestcase: boolean
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

      await fetch(`${baseUrl}/submission/test?problemId=${problemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: session?.token?.accessToken || ''
        },
        body: JSON.stringify({
          language,
          code: [
            {
              id: 1,
              text: editorCode,
              locked: false
            }
          ]
        })
      })
      let attempts = 0
      const maxAttempts = 10
      const interval = 2000
      let finalResult = null
      while (attempts < maxAttempts) {
        const pollRes = await fetch(
          `${baseUrl}/submission/test?problemId=${problemId}`,
          {
            method: 'GET',
            headers: {
              Authorization: session?.token?.accessToken || ''
            }
          }
        )
        const pollData = await pollRes.json()
        if (
          Array.isArray(pollData) &&
          pollData.every((r) => r.result !== 'Judging')
        ) {
          finalResult = pollData
          break
        }
        await new Promise((resolve) => setTimeout(resolve, interval))
        attempts++
      }
      if (finalResult) {
        const testcases = testcaseResult?.getProblem?.testcase || []
        const resultMap = new Map(finalResult.map((r) => [Number(r.id), r]))
        const mappedResults = testcases.map((testcase, idx) => {
          const testResult = resultMap.get(Number(testcase.id))
          return {
            id: Number(testcase.id),
            order: idx + 1,
            type: testcase.isHidden ? 'Hidden' : 'Sample',
            input: testcase.input ?? '',
            expectedOutput: testcase.output ?? '',
            output: testResult?.output ?? '',
            result: testResult?.result ?? '',
            isUserTestcase: false
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
  }, [language, editorCode, problemId, session, fetchTestcase])

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
          output: tc.output ?? ''
        }))}
        onReset={handleReset}
      >
        {children}
      </EditorMainResizablePanel>
    </div>
  )
}
