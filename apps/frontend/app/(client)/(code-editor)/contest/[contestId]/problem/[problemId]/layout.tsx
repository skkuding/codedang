import { EditorLayout } from '@/app/(client)/(code-editor)/_components/EditorLayout'

export default async function layout(props: {
  params: Promise<{ problemId: string; contestId: string }>
  children: React.ReactNode
}) {
  const { children } = props
  const { problemId, contestId } = await props.params

  return (
    <EditorLayout problemId={Number(problemId)} contestId={Number(contestId)}>
      {children}
    </EditorLayout>
  )
}
