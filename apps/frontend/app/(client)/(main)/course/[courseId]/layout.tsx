import { Cover } from '@/app/(client)/(main)/_components/Cover'
import { CourseSidebar } from './_components/CourseSidebar'

interface CourseLayoutProps {
  children: React.ReactNode
  params: Promise<{ courseId: string }>
}

export default async function Layout(props: CourseLayoutProps) {
  const { children } = props
  const { courseId } = await props.params
  return (
    <>
      <Cover
        title="COURSE"
        description="Structured Learning, Real-World Coding"
      />
      <div className="flex h-full w-full max-w-[1440px] flex-col">
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
