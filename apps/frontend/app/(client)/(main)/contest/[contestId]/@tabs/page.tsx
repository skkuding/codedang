import { safeGetContestDetail } from '@/app/(client)/_libs/apis/contest'
import { isErrorResponse } from '@/app/(client)/_libs/apis/utils'
import KatexContent from '@/components/KatexContent'
import { auth } from '@/libs/auth'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { ContestDetailErrorFallback } from './_components/ContestDetailErrorFallback'
import {
  GoToFirstProblemButton,
  GoToFirstProblemButtonFallback
} from './_components/GoToFirstProblemButton'
import RegisterButton from './_components/RegisterButton'

interface ContestDetailPageProps {
  params: {
    contestId: string
  }
}

export default async function ContestDetailPage({
  params
}: ContestDetailPageProps) {
  const session = await auth()
  const { contestId } = params

  const data = await safeGetContestDetail({ contestId: Number(contestId) })

  if (isErrorResponse(data)) {
    return <ContestDetailErrorFallback error={data} />
  }

  const startTime = new Date(data.startTime)
  const endTime = new Date(data.endTime)
  const currentTime = new Date()
  const state =
    currentTime >= endTime
      ? 'Finished'
      : currentTime < startTime
        ? 'Upcoming'
        : 'Ongoing'

  return (
    <>
      <KatexContent
        content={data.description}
        classname="prose w-full max-w-full border-b-2 border-b-gray-300 p-5 py-12"
      />
      {session && state !== 'Finished' && (
        <div className="mt-10 flex justify-center">
          {data.isRegistered ? (
            <ErrorBoundary fallback={null}>
              <Suspense fallback={<GoToFirstProblemButtonFallback />}>
                <GoToFirstProblemButton contestId={Number(contestId)} />
              </Suspense>
            </ErrorBoundary>
          ) : (
            <RegisterButton
              id={contestId}
              state={state}
              title={data.title}
              invitationCodeExists={data.invitationCodeExists}
            />
          )}
        </div>
      )}
    </>
  )
}
