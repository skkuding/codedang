import Cover from '@/components/Cover'
import { baseUrl } from '@/lib/vars'
import NoticeTable from './_components/NoticeTable'

export default async function Notice() {
  const notices = await fetch(baseUrl + '/notice?take=10').then((res) =>
    res.json()
  )
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <Cover
        title="Notice"
        description="Events and announcements of SKKU Coding Platform"
      />
      <main className="w-full max-w-5xl p-5">
        <NoticeTable data={notices} />
      </main>
    </div>
  )
}
