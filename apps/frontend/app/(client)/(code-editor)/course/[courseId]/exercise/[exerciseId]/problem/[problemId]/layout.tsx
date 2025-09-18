import { EditorLayout } from '@/app/(client)/(code-editor)/_components/EditorLayout'

export default async function layout(props: {
  params: Promise<{ problemId: string; exerciseId: string; courseId: string }>
  children: React.ReactNode
}) {
  const { children } = props
  const { problemId, exerciseId, courseId } = await props.params

  return (
    <EditorLayout
      problemId={Number(problemId)}
      exerciseId={Number(exerciseId)}
      courseId={Number(courseId)}
    >
      {children}
    </EditorLayout>
  )
}
