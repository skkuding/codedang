import EditorLayout from '@/app/(client)/(code-editor)/_components/EditorLayout'

export default function layout({
  params,
  children
}: {
  params: { problemId: string }
  children: React.ReactNode
}) {
  const { problemId } = params

  return <EditorLayout problemId={Number(problemId)}>{children}</EditorLayout>
}
