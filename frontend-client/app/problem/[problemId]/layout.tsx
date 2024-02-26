import EditorResizablePanel from '@/components/EditorResizablePanel'
import HeaderAuthPanel from '@/components/auth/HeaderAuthPanel'
import { auth } from '@/lib/auth'
import { fetcher } from '@/lib/utils'
import codedangLogo from '@/public/codedang-editor.svg'
import type { ProblemDetail } from '@/types/type'
import Image from 'next/image'
import Link from 'next/link'
import { IoIosArrowForward } from 'react-icons/io'

// TODO: problem 외에도 전체적인 revalidate 시간 논의 및 조정 필요
export const revalidate = 1

export default async function layout({
  params,
  children
}: {
  params: { problemId: string }
  children: React.ReactNode
}) {
  const { problemId } = params
  const problem: ProblemDetail = await fetcher(`problem/${problemId}`).json()

  const session = await auth()

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
            <h1 className="text-lg font-bold text-white">{`#${problemId}. ${problem.title}`}</h1>
          </div>
        </div>
        <HeaderAuthPanel session={session} group={'editor'} />
      </header>

      <EditorResizablePanel problem={problem}>{children}</EditorResizablePanel>
    </div>
  )
}
