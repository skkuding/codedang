import { auth } from '@/lib/auth'
import { fetcher } from '@/lib/utils'
import { sanitize } from 'isomorphic-dompurify'
import ParticipateButton from './_components/ParticipateButton'

interface ContestTop {
  description: string
  startTime: string
}

interface ContestTopProps {
  params: {
    id: string
  }
  tabs: React.ReactNode
}

export default async function ContestTop({ params }: ContestTopProps) {
  const session = await auth()
  const { id } = params
  const data: ContestTop = await fetcher.get(`contest/${id}`).json()
  const startTime = new Date(data.startTime)
  const currentTime = new Date()

  return (
    <>
      <main
        className="prose w-full max-w-full border-b-2 border-b-gray-300 p-5 py-12"
        dangerouslySetInnerHTML={{ __html: sanitize(data.description) }}
      />
      {session && currentTime < startTime && (
        <div className="mt-10 flex justify-center">
          <ParticipateButton id={id} />
        </div>
      )}
    </>
  )
}
