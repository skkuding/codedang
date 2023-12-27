import Cover from '@/components/Cover'
import { baseUrl } from '@/lib/vars'
import NoticeTable from './_components/NoticeTable'

export default async function Notice({
  searchParams
}: {
  searchParams: { page: string | undefined }
}) {
  const take = 4
  const page = searchParams.page ? Number(searchParams.page) : 1
  const cursor = (page - 1) * take

  const data = await fetch(
    baseUrl + `/notice?take=${take}${cursor ? `&cursor=${cursor}` : ''}`
  ).then((res) => res.json())
  console.log(data)
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <Cover
        title="Notice"
        description="Events and announcements of SKKU Coding Platform"
      />
      <main className="w-full max-w-5xl p-5">
        <NoticeTable data={data} page={page} />
      </main>
    </div>
  )
}
