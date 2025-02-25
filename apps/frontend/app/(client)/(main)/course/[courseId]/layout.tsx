import { CourseSidebar } from './_components/CourseSidebar'
import { Cover } from './_components/Cover'

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
        <div className="flex flex-row bg-red-50">
          <CourseSidebar courseId={courseId} />
          <article className="w-full">
            <div>{children}</div>
          </article>
        </div>
      </div>
    </>
  )
}
