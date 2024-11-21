import EditorLayout from '@/app/(client)/(code-editor)/_components/EditorLayout'

export default async function layout({
  params,
  children
}: {
  params: { problemId: number }
  children: React.ReactNode
}) {
  const { problemId } = params

  return <EditorLayout problemId={problemId}>{children}</EditorLayout>
}
