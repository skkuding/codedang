import EditorResizablePanel from '@/components/EditorResizablePanel'
import { fetcher } from '@/lib/utils'
import codedangLogo from '@/public/codedang-editor.svg'
import type { Contest, ContestProblem, ProblemDetail } from '@/types/type'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FaSortDown } from 'react-icons/fa'
import { IoIosArrowForward } from 'react-icons/io'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'

interface EditorLayoutProps {
  contestId?: string
  problemId: string
  children: React.ReactNode
}

export default async function EditorLayout({
  contestId,
  problemId,
  children
}: EditorLayoutProps) {
  const problems: { problems: ContestProblem[] } | null = contestId
    ? await fetcher('problem', {
        searchParams: {
          contestId
        }
      }).json()
    : null
  const problem: ProblemDetail = await fetcher(`problem/${problemId}`).json()

  const contest: Contest | null = contestId
    ? await fetcher(`contest/${contestId}`).json()
    : null
  return (
    <div className="grid-rows-editor grid h-dvh w-full min-w-[1000px] overflow-x-auto bg-slate-800 text-white">
      <header className="flex justify-between bg-slate-900 px-4">
        <div className="flex items-center justify-center gap-6 font-bold text-slate-500">
          <Link href="/">
            <Image src={codedangLogo} alt="코드당" width={33} />
          </Link>
          <div className="flex items-center gap-1">
            {contest ? (
              <Link href={`/contest/${contestId}` as Route}>
                {contest.title}
              </Link>
            ) : (
              <Link href="/problem">Problem</Link>
            )}
            <IoIosArrowForward className="size-6" />
            {contest ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex gap-1 text-lg font-bold text-white outline-none">
                  <h1>{`${problems?.problems.find((item) => item.id === Number(problemId))?.order}. ${problem.title}`}</h1>
                  <FaSortDown />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border-slate-700 bg-slate-900">
                  {problems?.problems.map((p: ContestProblem) => (
                    <Link key={p.id} href={`${p.id}` as Route}>
                      <DropdownMenuItem className="text-white hover:cursor-pointer focus:bg-slate-800 focus:text-white">
                        {`${p.order}. ${p.title}`}
                      </DropdownMenuItem>
                    </Link>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <h1 className="text-lg font-bold text-white">{`#${problem.id}. ${problem.title}`}</h1>
            )}
          </div>
        </div>
      </header>
      <EditorResizablePanel problem={problem} contestId={contestId}>
        {children}
      </EditorResizablePanel>
    </div>
  )
}
