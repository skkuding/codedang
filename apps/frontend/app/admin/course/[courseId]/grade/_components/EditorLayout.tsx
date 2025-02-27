import { GET_ASSIGNMENT } from '@/graphql/assignment/queries'
import { GET_PROBLEM } from '@/graphql/problem/queries'
import codedangLogo from '@/public/logos/codedang-editor.svg'
import { useSuspenseQuery } from '@apollo/client'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { AssignmentProblemDropdown } from './AssignmentProblemDropdown'
import { EditorMainResizablePanel } from './EditorResizablePanel'

interface EditorLayoutProps {
  courseId: number
  assignmentId: number
  problemId: number
  userId: number
  children: React.ReactNode
}

export function EditorLayout({
  courseId,
  assignmentId,
  problemId,
  userId,
  children
}: EditorLayoutProps) {
  const problem = {
    id: 1,
    title: '정수 더하기',
    order: 0
  }
  return (
    <div className="grid-rows-editor grid h-dvh w-full min-w-[1000px] overflow-x-auto bg-slate-800 text-white">
      <header className="flex h-12 justify-between bg-slate-900 px-6">
        <div className="flex items-center justify-center gap-4 text-lg text-[#787E80]">
          <Link href="/">
            <Image src={codedangLogo} alt="코드당" width={33} />
          </Link>
          <div className="flex items-center gap-1 font-medium">
            {/* {assignment.title} */}
            <p className="mx-2"> / </p>
            <AssignmentProblemDropdown
              problem={problem}
              assignmentId={assignmentId}
              courseId={courseId}
            />
          </div>
        </div>
      </header>
      <EditorMainResizablePanel code={'code'}>
        {children}
      </EditorMainResizablePanel>
    </div>
  )
}
