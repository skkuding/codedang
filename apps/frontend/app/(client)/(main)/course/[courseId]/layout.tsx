import { Separator } from '@/components/shadcn/separator'
import codedangLogo from '@/public/logos/codedang-with-text.svg'
import Image from 'next/image'
import Link from 'next/link'
import { Cover } from '../_components/Cover'
import { Sidebar } from './_components/Sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cover title="COURSE" description="Check your course" />
      <div className="flex h-dvh w-full flex-col">
        <div className="flex flex-row">
          <nav className="w-auto bg-white p-2 px-6 pb-6 pt-20 text-sm font-medium">
            <div className="mb-4 h-[165px] w-[305px] flex-col rounded bg-blue-200 p-5">
              <p>[SWE301_41]</p>
              <p>강의명은최대열세글자까지</p>
              <p>2025 spring</p>
              <p>prof. 박진영</p>
            </div>
            <Sidebar />
          </nav>
          <Separator orientation="vertical" />
          <article className="w-full">
            <div>{children}</div>
          </article>
        </div>
      </div>
    </>
  )
}
