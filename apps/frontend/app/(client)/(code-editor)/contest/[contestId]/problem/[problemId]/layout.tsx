import EditorLayout from '@/app/(client)/(code-editor)/_components/EditorLayout/EditorLayout'

export default async function layout({
  params,
  children
}: {
  params: { problemId: string; contestId: string }
  children: React.ReactNode
}) {
  const { problemId, contestId } = params

  return (
    <EditorLayout problemId={Number(problemId)} contestId={Number(contestId)}>
      {children}
    </EditorLayout>
  )
}
