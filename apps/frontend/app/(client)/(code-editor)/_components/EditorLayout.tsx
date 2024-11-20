import ContestStatusTimeDiff from '@/components/ContestStatusTimeDiff'
import HeaderAuthPanel from '@/components/auth/HeaderAuthPanel'
import { auth } from '@/libs/auth'
import { fetcher, fetcherWithAuth } from '@/libs/utils'
import codedangLogo from '@/public/logos/codedang-editor.svg'
import type { Contest, ContestProblem, ProblemDetail } from '@/types/type'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import ContestProblemDropdown from './ContestProblemDropdown'
import EditorMainResizablePanel from './EditorResizablePanel'

interface EditorLayoutProps {
  contestId?: number
  problemId: number
  children: React.ReactNode
}

interface ContestProblemProps {
  data: ContestProblem[]
  total: number
}

export default async function EditorLayout({
  contestId,
  problemId,
  children
}: EditorLayoutProps) {
  let problems: ContestProblemProps | undefined
  let contest: Contest | undefined
  let problem: ProblemDetail

  if (contestId) {
    // for getting contest info and problems list
    problems = await fetcherWithAuth
      .get(`contest/${contestId}/problem?take=20`)
      .json()
    const res = await fetcherWithAuth(
      `contest/${contestId}/problem/${problemId}`
    )

    if (!res.ok && res.status === 403) {
      redirect(`/contest/${contestId}/finished/problem/${problemId}`)
    }
    const ContestProblem: { problem: ProblemDetail } = await res.json()
    problem = ContestProblem.problem
    contest = await fetcher(`contest/${contestId}`).json()
    contest ? (contest.status = 'ongoing') : null // TODO: refactor this after change status interactively
  } else {
    problem = await fetcher(`problem/${problemId}`).json()
  }

  // for getting problem detail

  const session = await auth()

  return (
    <div className="grid-rows-editor grid h-dvh w-full min-w-[1000px] overflow-x-auto bg-slate-800 text-white">
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
                <Link href={`/contest/${contestId}` as Route}>
                  {contest.title}
                </Link>
                <p className="mx-2"> / </p>
                <ContestProblemDropdown
                  problems={problems}
                  problem={problem}
                  problemId={problemId}
                  contestId={contestId}
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
        enableCopyPaste //</div>={contest ? contest.enableCopyPaste : true}
      >
        {children}
      </EditorMainResizablePanel>
    </div>
  )
}
