import { CourseLayoutClient } from './_components/CourseLayoutClient'

interface CourseLayoutProps {
  children: React.ReactNode
  params: Promise<{ courseId: string }>
}

export default async function Layout(props: CourseLayoutProps) {
  const { children } = props
  const { courseId } = await props.params

  return <CourseLayoutClient courseId={courseId}>{children}</CourseLayoutClient>
}
