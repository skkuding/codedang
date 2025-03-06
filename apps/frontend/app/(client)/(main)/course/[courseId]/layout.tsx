import { Cover } from '@/app/(client)/(main)/_components/Cover'
import { CourseSidebar } from './_components/CourseSidebar'

interface CourseLayoutProps {
  children: React.ReactNode
  params: { courseId: string }
}

export default function Layout({ children, params }: CourseLayoutProps) {
  const { courseId } = params
  return (
    <>
      <Cover
        title="COURSE"
        description="Structured Learning, Real-World Coding"
      />
      <div className="flex h-full w-full flex-col">
        <div className="flex flex-row">
          <CourseSidebar courseId={courseId} />
          <article className="w-full">
            <div>{children}</div>
          </article>
        </div>
      </div>
    </>
  )
}
