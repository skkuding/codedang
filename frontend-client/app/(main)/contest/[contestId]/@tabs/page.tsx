import { auth } from '@/lib/auth'
import { fetcher } from '@/lib/utils'
import { sanitize } from 'isomorphic-dompurify'
import DeregisterButton from './_components/DeregisterButton'
import RegisterButton from './_components/RegisterButton'

interface ContestTop {
  description: string
  startTime: string
  endTime: string
  canRegister: boolean
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
  const data: ContestTop = await fetcher.get(`contest/${contestId}`).json()

  const startTime = new Date(data.startTime)
  const endTime = new Date(data.endTime)
  const currentTime = new Date()

  console.log(data)

  return (
    <>
      <main
        className="prose w-full max-w-full border-b-2 border-b-gray-300 p-5 py-12"
        dangerouslySetInnerHTML={{ __html: sanitize(data.description) }}
      />

      {/* Upcoming일때 */}
      {session && currentTime < startTime && !data.canRegister && (
        <div className="mt-10 flex justify-center">
          <RegisterButton id={contestId} />
        </div>
      )}
      {session && currentTime < startTime && !data.canRegister && (
        <div className="mt-10 flex justify-center">
          <DeregisterButton id={contestId} />
        </div>
      )}

      {/* Ongoing일때 */}
      {session &&
        currentTime >= startTime &&
        currentTime < endTime &&
        data.canRegister && (
          <div className="mt-10 flex justify-center">
            <RegisterButton id={contestId} />
          </div>
        )}
    </>
  )
}
