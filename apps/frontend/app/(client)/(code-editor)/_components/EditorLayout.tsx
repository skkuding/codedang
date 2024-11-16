'use client'

import ContestStatusTimeDiff from '@/components/ContestStatusTimeDiff'
import HeaderAuthPanel from '@/components/auth/HeaderAuthPanel'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import { auth } from '@/lib/auth'
import { cn, convertToLetter, fetcher, fetcherWithAuth } from '@/lib/utils'
import checkIcon from '@/public/icons/check-green.svg'
import codedangLogo from '@/public/logos/codedang-editor.svg'
import type { Contest, ContestProblem, ProblemDetail } from '@/types/type'
import type { Route } from 'next'
import type { Session } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaSortDown } from 'react-icons/fa'
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

export default function EditorLayout({
  contestId,
  problemId,
  children
}: EditorLayoutProps) {
  const [problems, setProblems] = useState<ContestProblemProps | undefined>()
  const [contest, setContest] = useState<Contest | undefined>()
  const [problem, setProblem] = useState<ProblemDetail | undefined>()
  const [session, setSession] = useState<Session | null>(null)

  const fetchData = async () => {
    let fetchedProblem: ProblemDetail
    let fetchedContest: Contest | undefined

    if (contestId) {
      // Get contest info and problems list
      const problemsResponse: ContestProblemProps = await fetcherWithAuth
        .get(`contest/${contestId}/problem?take=20`)
        .json()
      setProblems(problemsResponse)

      const res = await fetcherWithAuth(
        `contest/${contestId}/problem/${problemId}`
      )

      if (!res.ok && res.status === 403) {
        redirect(`/contest/${contestId}/finished/problem/${problemId}`)
        return // redirect 이후 코드는 실행되지 않도록 종료
      }

      const ContestProblem: { problem: ProblemDetail } = await res.json()
      fetchedProblem = ContestProblem.problem

      fetchedContest = await fetcher(`contest/${contestId}`).json()
      if (fetchedContest) {
        fetchedContest.status = 'ongoing' // TODO: refactor this after change status interactively
      }
    } else {
      fetchedProblem = await fetcher(`problem/${problemId}`).json()
    }

    setProblem(fetchedProblem)
    setContest(fetchedContest)
  }

  useEffect(() => {
    fetchData()
    const fetchSession = async () => {
      const sessionData = await auth()
      setSession(sessionData)
    }

    fetchSession()
  }, [])

  return (
    <>
      {problem && (
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
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex gap-1 text-lg text-white outline-none">
                        <h1>{`${convertToLetter(problems?.data.find((item) => item.id === Number(problemId))?.order as number)}. ${problem.title}`}</h1>
                        <FaSortDown />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="border-slate-700 bg-slate-900">
                        {problems?.data.map((p: ContestProblem) => (
                          <Link
                            key={p.id}
                            href={
                              `/contest/${contestId}/problem/${p.id}` as Route
                            }
                          >
                            <DropdownMenuItem
                              className={cn(
                                'flex justify-between text-white hover:cursor-pointer focus:bg-slate-800 focus:text-white',
                                problem.id === p.id &&
                                  'text-primary-light focus:text-primary-light'
                              )}
                            >
                              {`${convertToLetter(p.order)}. ${p.title}`}
                              {p.submissionTime && (
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
            onSubmit={fetchData}
          >
            {children}
          </EditorMainResizablePanel>
        </div>
      )}
    </>
  )
}
