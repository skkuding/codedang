import { EditorDescription } from '@/app/(client)/(code-editor)/_components/EditorDescription'
import { fetcher } from '@/libs/utils'
import type { ProblemDetail } from '@/types/type'

export default async function DescriptionPage({
  params
}: {
  params: { problemId: string }
}) {
  const { problemId } = params
  const problem: ProblemDetail = await fetcher(`problem/${problemId}`).json()

  return <EditorDescription problem={problem} />
}
