import { auth } from '@/lib/auth'
import { fetcherWithAuth } from '@/lib/utils'
import { sanitize } from 'isomorphic-dompurify'
import RegisterButton from './_components/RegisterButton'

interface ContestTop {
  description: string
  startTime: string
  endTime: string
  isRegistered: boolean
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
  const state =
    currentTime >= endTime
      ? 'Finished'
      : currentTime < startTime
        ? 'Upcoming'
        : 'Ongoing'

  return (
    <>
      <main
        className="prose w-full max-w-full border-b-2 border-b-gray-300 p-5 py-12"
        dangerouslySetInnerHTML={{ __html: sanitize(data.description) }}
      />

      {session && state !== 'Finished' && (
        <div className="mt-10 flex justify-center">
          <RegisterButton
            id={contestId}
            registered={data.isRegistered}
            state={state}
          />
        </div>
      )}
    </>
  )
}
