import { EditorLayout } from '@/app/(client)/(code-editor)/_components/EditorLayout'

export default async function layout(props: {
  params: Promise<{ problemId: string }>
  children: React.ReactNode
}) {
  const { children } = props
  const { problemId } = await props.params

  return <EditorLayout problemId={Number(problemId)}>{children}</EditorLayout>
}
