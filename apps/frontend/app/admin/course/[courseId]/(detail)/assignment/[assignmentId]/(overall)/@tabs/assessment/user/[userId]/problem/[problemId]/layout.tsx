import { EditorLayout } from '@/app/admin/_components/code-editor/EditorLayout'
import { auth } from '@/libs/auth'

export default async function layout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  return <EditorLayout session={session}>{children}</EditorLayout>
}
