import HeaderEditor from '@/app/problem/[id]/_components/HeaderEditor'
import { baseUrl } from '@/lib/vars'
import MainResizablePanel from './_components/MainResizablePanel'

export default async function layout({
  params,
  children
}: {
  params: { id: number }
  children: React.ReactNode
}) {
  const { id } = params
  const response = await fetch(baseUrl + '/problem/' + id)
  const data = await response.json()
  // Specific information for editor main page

  return (
    <div className="flex h-dvh w-full min-w-[1000px] flex-col overflow-x-auto bg-slate-700 text-white">
      <HeaderEditor id={data.id} title={data.title} />
      <main className="flex h-full flex-col overflow-hidden border border-slate-600">
        <MainResizablePanel data={data} tabs={children} />
      </main>
    </div>
  )
}
