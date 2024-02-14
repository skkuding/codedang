import { fetcher } from '@/lib/utils'
import codedangLogo from '@/public/codedang-editor.svg'
import type { ProblemDetail } from '@/types/type'
import Image from 'next/image'
import Link from 'next/link'
import { IoIosArrowForward } from 'react-icons/io'
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
    <div className="grid-rows-editor grid h-dvh w-full min-w-[1000px] overflow-x-auto bg-slate-800 text-white">
      <header className="flex justify-between bg-slate-900 px-4">
        <div className="flex items-center justify-center gap-6 font-bold text-slate-500">
          <Link href="/">
            <Image src={codedangLogo} alt="코드당" width={33} />
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/problem">Problem</Link>
            <IoIosArrowForward className="size-6" />
            <h1 className="text-lg font-bold text-white">{`#${id}. ${data.title}`}</h1>
          </div>
        </div>
      </header>
      <MainResizablePanel data={data}>{children}</MainResizablePanel>
    </div>
  )
}
