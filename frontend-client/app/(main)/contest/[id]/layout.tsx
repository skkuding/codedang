import { baseUrl } from '@/lib/vars'
import dayjs from 'dayjs'
import { sanitize } from 'isomorphic-dompurify'

interface ContestDetailProps {
  params: {
    id: string
  }
}

export default async function Layout({
  params,
  tabs
}: {
  params: ContestDetailProps['params']
  tabs: React.ReactNode
}) {
  const { id } = params
  const { title, startTime, endTime, description } = await fetch(
    baseUrl + `/contest/${id}`
  ).then((res) => res.json())
  return (
    <article>
      <header className="flex justify-between border-b border-b-gray-200 p-5 py-4">
        <h2 className="break-words text-2xl font-extrabold">{title}</h2>
        <div className="mt-1 flex gap-1 text-sm text-gray-400">
          <p>{dayjs(startTime).format('YYYY-MM-DD')}</p>
          <p>-</p>
          <p>{dayjs(endTime).format('YYYY-MM-DD')}</p>
        </div>
      </header>
      {tabs}
      <main
        className="prose w-full max-w-full border-b border-b-gray-200 p-5 py-12"
        dangerouslySetInnerHTML={{ __html: sanitize(description) }}
      />
    </article>
  )
}
