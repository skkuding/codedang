import { EditorDescription } from '@/components/EditorDescription'
import { fetcher } from '@/lib/utils'
import type { ProblemDetail } from '@/types/type'

export default async function DescriptionPage({
  params
}: {
  params: { problemId: number }
}) {
  const { problemId } = params
  const problem: ProblemDetail = await fetcher(`problem/${problemId}`).json()

  return <EditorDescription problem={problem} />
}
