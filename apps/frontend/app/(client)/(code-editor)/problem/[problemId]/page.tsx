import { EditorDescription } from '@/app/(client)/(code-editor)/_components/EditorDescription'
import { getProblemDetail } from '@/app/(client)/_libs/apis/problem'

export default async function DescriptionPage({
  params
}: {
  params: { problemId: string }
}) {
  const { problemId } = params

  /**NOTE: already handling error by EditorLayout */
  const problem = await getProblemDetail({ problemId: Number(problemId) })

  return <EditorDescription problem={problem} />
}
