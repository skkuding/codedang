'use client'

import { HeaderAuthPanel } from '@/components/auth/HeaderAuthPanel'
import { GET_ASSIGNMENT } from '@/graphql/assignment/queries'
import { GET_PROBLEM_TESTCASE } from '@/graphql/problem/queries'
import { GET_ASSIGNMENT_LATEST_SUBMISSION } from '@/graphql/submission/queries'
import { safeFetcherWithAuth } from '@/libs/utils'
import codedangLogo from '@/public/logos/codedang-editor.svg'
import { useTestcaseStore } from '@/stores/testcaseStore'
import { useSuspenseQuery } from '@apollo/client'
import type { TestCaseResult } from '@generated/graphql'
import type { Session } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useState, useEffect } from 'react'
import { AssignmentProblemDropdown } from './AssignmentProblemDropdown'
import { EditorMainResizablePanel } from './EditorResizablePanel'
import { mapTestResults } from './libs/util'

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
  const { data: assignmentResponse } = useSuspenseQuery(GET_ASSIGNMENT, {
    variables: {
      groupId: courseId,
      assignmentId
    },
    fetchPolicy: 'cache-first'
  })

  const { data: submissionResponse } = useSuspenseQuery(
    GET_ASSIGNMENT_LATEST_SUBMISSION,
    {
      variables: {
        groupId: courseId,
        assignmentId,
        userId,
        problemId
      },
      fetchPolicy: 'cache-first'
    }
  )

  const { data: problemResponse } = useSuspenseQuery(GET_PROBLEM_TESTCASE, {
    variables: {
      id: problemId
    },
    fetchPolicy: 'cache-first'
  })

  const assignment = assignmentResponse?.getAssignment
  const submissionData = submissionResponse?.getAssignmentLatestSubmission
  const testcaseData = problemResponse?.getProblem?.testcase

  const language = submissionData.language
  const [editorCode, setEditorCode] = useState('')
  const [initialCode, setInitialCode] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<
    (TestCaseResult & {
      expectedOutput: string
      order: number
      input: string
    })[]
  >([])
  const { setIsTestResult } = useTestcaseStore()

  const handleReset = () => {
    setEditorCode(initialCode)
    setTestResults([])
    setIsTestResult(false)
  }

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

  useEffect(() => {
    setEditorCode(submissionData.code)
    setInitialCode(submissionData.code)
    const mappedResults = mapTestResults(
      testcaseData,
      submissionData.testcaseResult
    )
    setTestResults(mappedResults)
  }, [submissionData])

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
        onReset={handleReset}
      >
        {children}
      </EditorMainResizablePanel>
    </div>
  )
}
