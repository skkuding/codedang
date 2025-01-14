import KatexContent from '@/components/KatexContent'
import { auth } from '@/libs/auth'
import { fetcherWithAuth } from '@/libs/utils'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import {
  GoToFirstProblemButton,
  GoToFirstProblemButtonFallback
} from './_components/GoToFirstProblemButton'
import RegisterButton from './_components/RegisterButton'

interface ContestTop {
  title: string
  description: string
  startTime: string
  endTime: string
  isRegistered: boolean
  invitationCodeExists: boolean
}

interface ContestTopProps {
  params: {
    contestId: string
  }
}

export default async function ContestTop({ params }: ContestTopProps) {
  const session = await auth()
  const { contestId } = params
  const data: ContestTop = await fetcherWithAuth
    .get(`contest/${contestId}`)
    .json()

  const startTime = new Date(data.startTime)
  const endTime = new Date(data.endTime)
  const currentTime = new Date()
  const state = (() => {
    if (currentTime >= endTime) {
      return 'Finished'
    }

    if (currentTime < startTime) {
      return 'Upcoming'
    }

    return 'Ongoing'
  })()

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
