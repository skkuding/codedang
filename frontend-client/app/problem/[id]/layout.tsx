import HeaderEditor from '@/app/problem/[id]/_components/HeaderEditor'
import { fetcher } from '@/lib/utils'
import type { ProblemDetail } from '@/types/type'
import MainResizablePanel from './_components/MainResizablePanel'

export default async function layout({
  params,
  children
}: {
  params: { id: number }
  children: React.ReactNode
}) {
  const { id } = params
  const data: ProblemDetail = await fetcher(`problem/${id}`).json()

  return (
    <div className="grid-rows-editor grid h-dvh w-full min-w-[1000px] overflow-x-auto bg-slate-700 text-white">
      <HeaderEditor id={data.id} title={data.title} />
      <MainResizablePanel data={data}>{children}</MainResizablePanel>
    </div>
  )
}
