import { baseUrl } from '@/lib/constants'
import { dateFormatter } from '@/lib/utils'
import { sanitize } from 'isomorphic-dompurify'

interface ContestDetailProps {
  params: {
    contestId: string
  }
}

export default async function ContestDetail({ params }: ContestDetailProps) {
  const { contestId } = params
  const { title, startTime, endTime, description } = await fetch(
    baseUrl + `/contest/${contestId}`
  ).then((res) => res.json())
  return (
    <article>
      <header className="flex justify-between border-b border-b-gray-200 p-5 py-4">
        <h2 className="break-words text-2xl font-extrabold">{title}</h2>
        <div className="mt-1 flex gap-1 text-sm text-gray-400">
          <p>{dateFormatter(startTime, 'YYYY-MM-DD')}</p>
          <p>-</p>
          <p>{dateFormatter(endTime, 'YYYY-MM-DD')}</p>
        </div>
      </header>
      <main
        className="prose w-full max-w-full border-b border-b-gray-200 p-5 py-12"
        dangerouslySetInnerHTML={{ __html: sanitize(description) }}
      />
    </article>
  )
}
