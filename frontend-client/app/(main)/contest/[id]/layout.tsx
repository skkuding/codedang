import { baseUrl } from '@/lib/vars'
import dayjs from 'dayjs'

export interface ContestDetailProps {
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
  const { title, startTime, endTime } = await fetch(
    baseUrl + `/contest/${id}`
  ).then((res) => res.json())
  return (
    <article>
      <header className="flex justify-between p-5 py-4">
        <h2 className="break-words text-2xl font-extrabold">{title}</h2>
        <div className="mt-1 flex gap-1 text-sm text-gray-400">
          <p>{dayjs(startTime).format('YYYY-MM-DD')}</p>
          <p>-</p>
          <p>{dayjs(endTime).format('YYYY-MM-DD')}</p>
        </div>
      </header>
      {tabs}
    </article>
  )
}
