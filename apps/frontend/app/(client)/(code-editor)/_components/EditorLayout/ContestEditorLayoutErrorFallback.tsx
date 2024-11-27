import { Button } from '@/components/shadcn/button'
import { fetcher } from '@/libs/utils'
import exitIcon from '@/public/icons/exit.svg'
import visitIcon from '@/public/icons/visit.svg'
import Image from 'next/image'
import Link from 'next/link'
import type { ErrorResponse } from '../../../_libs/apis/types'
import EditorSkeleton from './EditorSkeleton'

interface ContestEditorLayoutErrorFallbackProps {
  error: ErrorResponse
  contestId: number
  problemId: number
}

export async function ContestEditorLayoutErrorFallback({
  error,
  contestId,
  problemId
}: ContestEditorLayoutErrorFallbackProps) {
  let message = 'Something went wrong!'
  let isFinishedContest = false
  let isContestExist = true

  if (
    error.statusCode === 403 &&
    error.message === 'Cannot access to Contest problem after the contest ends.'
  ) {
    message = 'The contest has finished!'
    isFinishedContest = true
  }

  if (
    error.statusCode === 403 &&
    error.message === 'Register to access this problem.'
  ) {
    message = 'Please register contest first to view this problem'
  }

  if (
    error.statusCode === 403 &&
    error.message ===
      'Cannot access to Contest problem before the contest starts.'
  ) {
    message = 'You can access the problem after the contest started'
  }

  if (error.statusCode === 404) {
    message = 'Contest does not exist'
    isContestExist = false
  }

  return (
    <>
      <EditorSkeleton />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-10 text-white backdrop-blur-md">
        <div className="text-center">
          <h1 className="mb-8 font-mono text-2xl">{message}</h1>
          {isFinishedContest && (
            <FinishedContestProblem problemId={problemId} />
          )}
          <Link
            href={
              !isContestExist ? '/contest' : `/contest/${contestId}/problem`
            }
          >
            <Button
              size="icon"
              className="ml-4 h-10 w-24 shrink-0 gap-[5px] rounded-[4px] bg-blue-500 font-sans hover:bg-blue-700"
            >
              <Image src={exitIcon} alt="exit" width={20} height={20} />
              Exit
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}

async function FinishedContestProblem({ problemId }: { problemId: number }) {
  const isProblemPubliclyAvailable =
    (await fetcher.head(`problem/${problemId}`)).status === 200

  return (
    <>
      {isProblemPubliclyAvailable ? (
        <>
          <p className="mb-2 font-sans font-light">
            You can solve the public problem regardless of scoring,
          </p>
          <p className="mb-10 font-sans font-light">
            or click the exit button below to exit the page.
          </p>
        </>
      ) : (
        <>
          <p className="mb-2 font-sans font-light">
            This problem is now unavailable to students.
          </p>
          <p className="mb-10 font-sans font-light">
            Click the button below to exit the page.
          </p>
        </>
      )}
      {isProblemPubliclyAvailable && (
        <Link href={`/problem/${problemId}`}>
          <Button
            size="icon"
            className="h-10 w-48 shrink-0 gap-[5px] rounded-[4px] border border-blue-500 bg-blue-100 font-sans text-blue-500 hover:bg-blue-300"
          >
            <Image src={visitIcon} alt="exit" width={20} height={20} />
            Visit Public Problem
          </Button>
        </Link>
      )}
    </>
  )
}
