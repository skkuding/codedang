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

/*

  Register : Upcoming, Ongoing
  Deregister : Upcoming

  +) Finished 일때는 아무것도 안뜸

  * 나눠야하는 경우 (전부 로그인 돼있을때의 경우!)
  1. Finished인 경우 -> 아무것도 안뜸
  2. Upcoming이면서, 현재상태가 Register 인 경우 -> Deregister 버튼
  3. Upcoming, Ongoing이면서, 현재상태가 Unregister 인 경우 -> Register 버튼

*/

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
