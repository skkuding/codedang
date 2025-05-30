'use client'

import { HeaderAuthPanel } from '@/components/auth/HeaderAuthPanel'
import { GET_ASSIGNMENT } from '@/graphql/assignment/queries'
import { GET_ASSIGNMENT_LATEST_SUBMISSION } from '@/graphql/submission/queries'
import codedangLogo from '@/public/logos/codedang-editor.svg'
import { useQuery, useSuspenseQuery } from '@apollo/client'
import type { Session } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { AssignmentProblemDropdown } from './AssignmentProblemDropdown'
import { EditorMainResizablePanel } from './EditorResizablePanel'

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

  const submissionData = data ? data?.getAssignmentLatestSubmission : null

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
        language={submissionData?.language ?? 'C'}
        code={submissionData?.code ?? ''}
        courseId={courseId}
        userId={userId}
      >
        {children}
      </EditorMainResizablePanel>
    </div>
  )
}
