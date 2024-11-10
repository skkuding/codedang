import EditorLayout from '@/app/(client)/(code-editor)/_components/EditorLayout'

export default async function layout({
  params,
  children
}: {
  params: { problemId: number; contestId: number }
  children: React.ReactNode
}) {
  const { problemId, contestId } = params

  return (
    <EditorLayout problemId={problemId} contestId={contestId}>
      {children}
    </EditorLayout>
  )
}
