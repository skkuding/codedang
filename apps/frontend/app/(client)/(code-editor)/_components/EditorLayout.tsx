import { AssignmentStatusTimeDiff } from '@/components/AssignmentStatusTimeDiff'
import { ContestStatusTimeDiff } from '@/components/ContestStatusTimeDiff'
import { HeaderAuthPanel } from '@/components/auth/HeaderAuthPanel'
import { auth } from '@/libs/auth'
import { fetcher, fetcherWithAuth } from '@/libs/utils'
import codedangLogo from '@/public/logos/codedang-editor.svg'
import type { Assignment, Contest, ProblemDetail } from '@/types/type'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { GetAssignmentProblemDetailResponse } from '../../_libs/apis/assignmentProblem'
import type { GetContestProblemDetailResponse } from '../../_libs/apis/contestProblem'
import { AssignmentProblemDropdown } from './AssignmentProblemDropdown'
import { ContestProblemDropdown } from './ContestProblemDropdown'
import { EditorMainResizablePanel } from './EditorResizablePanel'

interface EditorLayoutProps {
  assignmentId?: number
  courseId?: number
  contestId?: number
  problemId: number
  children: React.ReactNode
}

export async function EditorLayout({
  assignmentId,
  courseId,
  contestId,
  problemId,
  children
}: EditorLayoutProps) {
  let assignment: Assignment | undefined
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
  } else if (assignmentId) {
    // for getting assignment info and problems list
    const res = await fetcherWithAuth(
      `assignment/${assignmentId}/problem/${problemId}`
    )
    if (!res.ok && res.status === 403) {
      redirect(
        // TODO: ..!!!!
        `/course/${courseId}/assignment/${assignmentId}/finished/problem/${problemId}`
      )
    }

    const assignmentProblem =
      await res.json<GetAssignmentProblemDetailResponse>()
    problem = { ...assignmentProblem.problem, order: assignmentProblem.order }

    assignment = await fetcher(`assignment/${assignmentId}`).json()
    assignment && (assignment.status = 'ongoing')
  } else {
    problem = await fetcher(`problem/${problemId}`).json()
  }

  const session = await auth()

  return (
    <div className="grid-rows-editor grid h-dvh w-full min-w-[1000px] overflow-x-auto bg-slate-800 text-white">
      <header className="flex h-12 justify-between bg-slate-900 px-6">
        <div className="flex items-center justify-center gap-4 text-lg text-[#787E80]">
          <Link href="/">
            <Image src={codedangLogo} alt="코드당" width={33} />
          </Link>
          <div className="flex items-center gap-1 font-medium">
            {renderHeaderContent({ contest, assignment, problem, courseId })}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {renderTimediff({ contest, assignment })}
          <HeaderAuthPanel session={session} group={'editor'} />
        </div>
      </header>
      <EditorMainResizablePanel
        problem={problem}
        contestId={contestId}
        courseId={courseId}
        assignmentId={assignmentId}
        enableCopyPaste={contest ? contest.enableCopyPaste : true}
      >
        {children}
      </EditorMainResizablePanel>
    </div>
  )
}

const renderHeaderContent = ({
  contest,
  assignment,
  problem,
  courseId
}: {
  contest?: Contest | undefined
  assignment?: Assignment | undefined
  courseId?: number | undefined
  problem: Required<ProblemDetail>
}) => {
  if (contest) {
    return (
      <>
        Contest <p className="mx-2"> / </p>
        <Link href={`/contest/${contest.id}`}>{contest.title}</Link>
        <p className="mx-2"> / </p>
        <ContestProblemDropdown problem={problem} contestId={contest.id} />
      </>
    )
  } else if (assignment) {
    return (
      <>
        assignment <p className="mx-2"> / </p>
        <Link href={`/course/${courseId}/assignment/${assignment.id}` as Route}>
          {assignment.title}
        </Link>
        <p className="mx-2"> / </p>
        {courseId !== undefined && (
          <AssignmentProblemDropdown
            problem={problem}
            assignmentId={assignment.id}
            courseId={courseId}
          />
        )}
      </>
    )
  } else {
    return (
      <>
        <Link href="/problem">Problem</Link> <p className="mx-2"> / </p>{' '}
        <h1 className="w-[1024px] overflow-hidden text-ellipsis whitespace-nowrap text-lg font-medium text-white">{`#${problem.id}. ${problem.title}`}</h1>
      </>
    )
  }
}

const renderTimediff = ({
  contest,
  assignment
}: {
  contest?: Contest | undefined
  assignment?: Assignment | undefined
}) => {
  if (contest) {
    return (
      <ContestStatusTimeDiff
        contest={contest}
        textStyle="text-sm text-error"
        inContestEditor={true}
      />
    )
  } else if (assignment) {
    return (
      <AssignmentStatusTimeDiff
        assignment={assignment}
        textStyle="text-sm text-error"
        inAssignmentEditor={true}
      />
    )
  } else {
    return null
  }
}
