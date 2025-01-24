import { ContestStatusTimeDiff } from '@/components/ContestStatusTimeDiff'
import { HeaderAuthPanel } from '@/components/auth/HeaderAuthPanel'
import { auth } from '@/libs/auth'
import { fetcher, fetcherWithAuth } from '@/libs/utils'
import codedangLogo from '@/public/logos/codedang-editor.svg'
import type { Contest, ProblemDetail } from '@/types/type'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { GetContestProblemDetailResponse } from '../../_libs/apis/contestProblem'
import { ContestProblemDropdown } from './ContestProblemDropdown'
import { EditorMainResizablePanel } from './EditorResizablePanel'

interface EditorLayoutProps {
  contestId?: number
  problemId: number
  children: React.ReactNode
}

export async function EditorLayout({
  contestId,
  problemId,
  children
}: EditorLayoutProps) {
  let contest: Contest | undefined
  let problem: Required<ProblemDetail>

  if (contestId) {
    // for getting contest info and problems list

    // TODO: use `getContestProblemDetail` from _libs/apis folder & use error boundary
    const res = await fetcherWithAuth(
      `contest/${contestId}/problem/${problemId}`
    )
    if (!res.ok && res.status === 403) {
      redirect(`/contest/${contestId}/finished/problem/${problemId}`)
    }

    const contestProblem = await res.json<GetContestProblemDetailResponse>()
    problem = { ...contestProblem.problem, order: contestProblem.order }

    contest = await fetcher(`contest/${contestId}`).json()
    contest && (contest.status = 'ongoing') // TODO: refactor this after change status interactively
  } else {
    problem = await fetcher(`problem/${problemId}`).json()
  }

  const session = await auth()

  return (
    <div className="grid h-dvh w-full min-w-[1000px] grid-rows-editor overflow-x-auto bg-slate-800 text-white">
      <header className="flex h-12 justify-between bg-slate-900 px-6">
        <div className="flex items-center justify-center gap-4 text-lg text-[#787E80]">
          <Link href="/">
            <Image src={codedangLogo} alt="코드당" width={33} />
          </Link>
          <div className="flex items-center gap-1 font-medium">
            {contest ? <>Contest</> : <Link href="/problem">Problem</Link>}
            <p className="mx-2"> / </p>
            {contest ? (
              <>
                <Link href={`/contest/${contest.id}`}>{contest.title}</Link>
                <p className="mx-2"> / </p>
                <ContestProblemDropdown
                  problem={problem}
                  contestId={contest.id}
                />
              </>
            ) : (
              <h1 className="w-[1024px] overflow-hidden text-ellipsis whitespace-nowrap text-lg font-medium text-white">{`#${problem.id}. ${problem.title}`}</h1>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {contest ? (
            <ContestStatusTimeDiff
              contest={contest}
              textStyle="text-sm text-error"
              inContestEditor={true}
            />
          ) : null}
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
    </div>
  )
}
