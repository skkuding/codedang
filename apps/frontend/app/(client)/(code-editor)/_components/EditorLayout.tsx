import { ContestStatusTimeDiff } from '@/components/ContestStatusTimeDiff'
import { CountdownStatus } from '@/components/CountdownStatus'
import { HeaderAuthPanel } from '@/components/auth/HeaderAuthPanel'
import { auth } from '@/libs/auth'
import { fetcher, fetcherWithAuth, hasDueDate, omitString } from '@/libs/utils'
import codedangLogo from '@/public/logos/codedang-editor.svg'
import type { Assignment, Contest, Course, ProblemDetail } from '@/types/type'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { GetAssignmentProblemDetailResponse } from '../../_libs/apis/assignmentProblem'
import type { GetContestProblemDetailResponse } from '../../_libs/apis/contestProblem'
import { AssignmentProblemDropdown } from './AssignmentProblemDropdown'
import { ContestProblemDropdown } from './ContestProblemDropdown'
import { EditorMainResizablePanel } from './EditorResizablePanel'
import { ExerciseProblemDropdown } from './ExerciseProblemDropdown'
import { ProblemProvider } from './context/ProblemContext'

interface EditorLayoutProps {
  assignmentId?: number
  exerciseId?: number
  courseId?: number
  contestId?: number
  problemId: number
  children: React.ReactNode
}

export async function EditorLayout({
  assignmentId,
  exerciseId,
  courseId,
  contestId,
  problemId,
  children
}: EditorLayoutProps) {
  let assignment: Assignment | undefined
  let exercise: Assignment | undefined
  let contest: Contest | undefined
  let problem: Required<ProblemDetail>
  let courseName: string | undefined

  if (contestId) {
    // for getting contest info and problems list
    // TODO: use `getContestProblemDetail` from _libs/apis folder & use error boundary
    const res = await fetcherWithAuth(
      `contest/${contestId}/problem/${problemId}`
    )
    if (!res.ok && (res.status === 403 || res.status === 401)) {
      redirect(`/contest/${contestId}/finished/problem/${problemId}`)
    }

    const contestProblem = await res.json<GetContestProblemDetailResponse>()
    problem = { ...contestProblem.problem, order: contestProblem.order }

    contest = await fetcher(`contest/${contestId}`).json()
    contest && (contest.status = 'ongoing') // TODO: refactor this after change status interactively
  } else if (courseId && assignmentId) {
    // for getting course info
    const courseRes = await fetcherWithAuth(`course/${courseId}`)
    if (courseRes.ok) {
      const courseData = await courseRes.json<Omit<Course, 'description'>>()
      courseName = courseData.groupName
    }

    // for getting assignment info and problems list
    const assignmentRes = await fetcherWithAuth(
      `assignment/${assignmentId}/problem/${problemId}`,
      {
        searchParams: { groupId: courseId }
      }
    )
    if (!assignmentRes.ok && assignmentRes.status === 403) {
      redirect(
        `/course/${courseId}/assignment/${assignmentId}/finished/problem/${problemId}`
      )
    }

    const assignmentProblem =
      await assignmentRes.json<GetAssignmentProblemDetailResponse>()
    problem = { ...assignmentProblem.problem, order: assignmentProblem.order }

    assignment = await fetcherWithAuth(`assignment/${assignmentId}`).json()
    assignment && (assignment.status = 'ongoing')
  } else if (courseId && exerciseId) {
    // for getting course info
    const courseRes = await fetcherWithAuth(`course/${courseId}`)
    if (courseRes.ok) {
      const courseData = await courseRes.json<Omit<Course, 'description'>>()
      courseName = courseData.groupName
    }

    // for getting assignment info and problems list
    const exerciseRes = await fetcherWithAuth(
      `assignment/${exerciseId}/problem/${problemId}`,
      {
        searchParams: { groupId: courseId }
      }
    )
    if (!exerciseRes.ok && exerciseRes.status === 403) {
      redirect(
        `/course/${courseId}/exercise/${exerciseId}/finished/problem/${problemId}`
      )
    }

    const exerciseProblem =
      await exerciseRes.json<GetAssignmentProblemDetailResponse>()
    problem = { ...exerciseProblem.problem, order: exerciseProblem.order }

    exercise = await fetcherWithAuth(`assignment/${exerciseId}`).json()
    exercise && (exercise.status = 'ongoing')
  } else {
    problem = await fetcher(`problem/${problemId}`).json()
  }

  problem.problemTestcase = problem.problemTestcase.sort(
    (a, b) => (a.order ?? a.id) - (b.order ?? b.id)
  )

  const session = await auth()

  return (
    <ProblemProvider problem={problem}>
      <div className="grid-rows-editor grid h-dvh w-full min-w-[1000px] overflow-x-auto bg-slate-800 text-white">
        <header className="flex h-12 justify-between bg-slate-900 px-6">
          <div className="flex items-center justify-center gap-4 text-lg text-[#787E80]">
            <Link href="/">
              <Image src={codedangLogo} alt="코드당" width={33} />
            </Link>
            <div className="flex items-center gap-1 font-medium">
              {renderHeaderContent({
                contest,
                assignment,
                exercise,
                problem,
                courseId,
                courseName
              })}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {renderTimediff({ contest, assignment, exercise })}
            <HeaderAuthPanel session={session} group={'editor'} />
          </div>
        </header>
        <EditorMainResizablePanel
          problem={problem}
          contestId={contestId}
          courseId={courseId}
          assignmentId={assignmentId}
          exerciseId={exerciseId}
          enableCopyPaste={(() => {
            if (contest) {
              return contest.enableCopyPaste
            } else if (assignment) {
              return assignment.enableCopyPaste
            } else if (exercise) {
              return exercise.enableCopyPaste
            } else {
              return true
            }
          })()}
        >
          {children}
        </EditorMainResizablePanel>
      </div>
    </ProblemProvider>
  )
}

interface HeaderContentProps {
  contest?: Contest | undefined
  assignment?: Assignment | undefined
  exercise?: Assignment | undefined
  courseId?: number | undefined
  courseName?: string | undefined
  problem: Required<ProblemDetail>
}

const renderHeaderContent = ({
  contest,
  assignment,
  exercise,
  problem,
  courseId,
  courseName
}: HeaderContentProps) => {
  if (contest) {
    return (
      <>
        <Link href={'/contest'}>
          <p>Contest</p>
        </Link>
        <p className="mx-2"> / </p>
        <Link href={`/contest/${contest.id}`}>
          {omitString({ targetString: contest.title, maxlength: 20 })}
        </Link>
        <p className="mx-2"> / </p>
        <ContestProblemDropdown problem={problem} contestId={contest.id} />
      </>
    )
  } else if (assignment && courseName) {
    return (
      <>
        <Link href={`/course/${courseId}/assignment` as Route}>
          <p> {omitString({ targetString: courseName, maxlength: 20 })}</p>
        </Link>
        <p className="mx-2"> / </p>
        <Link href={`/course/${courseId}/assignment/${assignment.id}` as Route}>
          {omitString({ targetString: assignment.title, maxlength: 20 })}
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
  } else if (exercise && courseName) {
    return (
      <>
        <Link href={`/course/${courseId}/exercise`}>
          <p> {omitString({ targetString: courseName, maxlength: 20 })}</p>
        </Link>
        <p className="mx-2"> / </p>
        <Link href={`/course/${courseId}/exercise/${exercise.id}`}>
          {omitString({ targetString: exercise.title, maxlength: 20 })}
        </Link>
        <p className="mx-2"> / </p>
        {courseId !== undefined && (
          <ExerciseProblemDropdown
            problem={problem}
            exerciseId={exercise.id}
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
  assignment,
  exercise
}: {
  contest?: Contest | undefined
  assignment?: Assignment | undefined
  exercise?: Assignment | undefined
}) => {
  if (contest) {
    return (
      <ContestStatusTimeDiff
        contest={contest}
        textStyle="text-sm text-error"
        inContestEditor={true}
      />
    )
  }
  const item = assignment ?? exercise

  if (item && (item.dueTime ?? hasDueDate(item.endTime))) {
    return (
      <CountdownStatus
        baseTime={item.dueTime ?? item.endTime}
        target={assignment ? 'assignment' : 'exercise'}
        showTarget={false}
        inEditor={true}
      />
    )
  }

  return null
}
