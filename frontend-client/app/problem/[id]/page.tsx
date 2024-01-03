import icon from '@/app/icon.png'
import Image from 'next/image'
import { IoIosArrowForward } from 'react-icons/io'
import MainResizablePanel from './_components/MainResizablePanel'

export default async function ProblemEditor() {
  return (
    <div className="flex h-dvh w-full flex-col bg-slate-700 text-white">
      <header className="flex h-12 shrink-0 justify-between bg-slate-800">
        <div className="flex items-center justify-center text-slate-500">
          <Image src={icon} alt="코드당" width={30} className="mx-7" />
          Problem <IoIosArrowForward className="size-6" />
          {/* Problem Name 임의 */}
          <span className="text-white">가파른 경사</span>
        </div>
        <div className="mr-4 flex items-center justify-center">
          <span className="text-slate-500">ENG</span>
          <span className="mx-2">l</span>
        </div>
      </header>
      <main className="flex h-full flex-col border border-slate-600">
        <div className="h-12 shrink-0 border-b border-b-slate-600"></div>
        <MainResizablePanel />
      </main>
    </div>
  )
}
