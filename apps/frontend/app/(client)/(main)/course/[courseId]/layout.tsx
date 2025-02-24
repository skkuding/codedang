import { CourseInfoBox } from './_components/CourseInfoBox'
import { Cover } from './_components/Cover'
import { Sidebar } from './_components/Sidebar'

interface CourseLayoutProps {
  children: React.ReactNode
  params: { courseId: string }
}

export default function Layout({ children, params }: CourseLayoutProps) {
  const { courseId } = params
  return (
    <>
      <Cover title="COURSE" description="Check your course" />
      <div className="flex h-full w-full flex-col">
        <div className="flex flex-row">
          <nav className="w-auto border-r border-r-slate-200 bg-white p-2 px-6 pt-20 text-sm font-medium">
            <CourseInfoBox courseId={courseId} />
            <Sidebar />
          </nav>
          <article className="w-full">
            <div>{children}</div>
          </article>
        </div>
      </div>
    </>
  )
}
