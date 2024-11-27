import { safeGetContestDetail } from '@/app/(client)/_libs/apis/contest'
import { safeGetProblemDetail } from '@/app/(client)/_libs/apis/problem'
import ContestStatusTimeDiff from '@/components/ContestStatusTimeDiff'
import HeaderAuthPanel from '@/components/auth/HeaderAuthPanel'
import { auth } from '@/libs/auth'
import codedangLogo from '@/public/logos/codedang-editor.svg'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { safeGetContestProblemDetail } from '../../../_libs/apis/contestProblem'
import { isErrorResponse } from '../../../_libs/apis/utils'
import EditorMainResizablePanel from '../EditorResizablePanel'
import { ContestEditorLayoutErrorFallback } from './ContestEditorLayoutErrorFallback'
import ContestProblemDropdown from './ContestProblemDropdown'
import { ProblemEditorLayoutErrorFallback } from './ProblemEditorLayoutErrorFallback'

interface EditorLayoutProps {
  contestId?: number
  problemId: number
  children: ReactNode
}

export default async function EditorLayout({
  contestId,
  problemId,
  children
}: EditorLayoutProps) {
  return (
    <div className="grid-rows-editor grid h-dvh w-full min-w-[1000px] overflow-x-auto bg-slate-800 text-white">
      {/**TODO: add error boundary (handling unexpected error) */}
      {contestId ? (
        <ContestLayout contestId={contestId} problemId={problemId}>
          {children}
        </ContestLayout>
      ) : (
        <ProblemLayout problemId={problemId}>{children}</ProblemLayout>
      )}
    </div>
  )
}

async function ContestLayout({
  contestId,
  problemId,
  children
}: {
  contestId: number
  problemId: number
  children: ReactNode
}) {
  const contest = await safeGetContestDetail({ contestId })

  if (isErrorResponse(contest)) {
    return (
      <ContestEditorLayoutErrorFallback
        error={contest}
        problemId={problemId}
        contestId={contestId}
      />
    )
  }

  const contestProblem = await safeGetContestProblemDetail({
    contestId,
    problemId
  })

  if (isErrorResponse(contestProblem)) {
    return (
      <ContestEditorLayoutErrorFallback
        error={contestProblem}
        problemId={problemId}
        contestId={contestId}
      />
    )
  }

  const problem = { ...contestProblem.problem, order: contestProblem.order }

  const session = await auth()

  return (
    <>
      <header className="flex h-12 justify-between bg-slate-900 px-6">
        <div className="flex items-center justify-center gap-4 text-lg text-[#787E80]">
          <Link href="/">
            <Image src={codedangLogo} alt="코드당" width={33} />
          </Link>
          <div className="flex items-center gap-1 font-medium">
            Contest
            <p className="mx-2"> / </p>
            <Link href={`/contest/${contest.id}`}>{contest.title}</Link>
            <p className="mx-2"> / </p>
            <ContestProblemDropdown problem={problem} contestId={contest.id} />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ContestStatusTimeDiff
            contest={contest}
            textStyle="text-sm text-error"
            inContestEditor={true}
          />
          <HeaderAuthPanel session={session} group={'editor'} />
        </div>
      </header>
      <EditorMainResizablePanel
        problem={problem}
        contestId={contestId}
        enableCopyPaste={contest ? contest.enableCopyPaste : true}
      >
        {children}
      </EditorMainResizablePanel>
    </>
  )
}

async function ProblemLayout({
  problemId,
  children
}: {
  problemId: number
  children: ReactNode
}) {
  const session = await auth()
  const problem = await safeGetProblemDetail({ problemId })

  if (isErrorResponse(problem)) {
    return <ProblemEditorLayoutErrorFallback error={problem} />
  }

  return (
    <>
      <header className="flex h-12 justify-between bg-slate-900 px-6">
        <div className="flex items-center justify-center gap-4 text-lg text-[#787E80]">
          <Link href="/">
            <Image src={codedangLogo} alt="코드당" width={33} />
          </Link>
          <div className="flex items-center gap-1 font-medium">
            <Link href="/problem">Problem</Link>
            <p className="mx-2"> / </p>
            <h1 className="w-[1024px] overflow-hidden text-ellipsis whitespace-nowrap text-lg font-medium text-white">{`#${problem.id}. ${problem.title}`}</h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <HeaderAuthPanel session={session} group={'editor'} />
        </div>
      </header>
      <EditorMainResizablePanel problem={problem} enableCopyPaste={true}>
        {children}
      </EditorMainResizablePanel>
    </>
  )
}
