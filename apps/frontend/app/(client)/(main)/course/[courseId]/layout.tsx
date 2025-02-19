import { Separator } from '@/components/shadcn/separator'
import { CourseInfoBox } from './_components/CourseInfoBox'
import { Cover } from './_components/Cover'
import { Sidebar } from './_components/Sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cover title="COURSE" description="Check your course" />
      <div className="flex h-dvh w-full flex-col">
        <div className="flex flex-row">
          <nav className="w-auto bg-white p-2 px-6 pb-6 pt-20 text-sm font-medium">
            <CourseInfoBox />
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
