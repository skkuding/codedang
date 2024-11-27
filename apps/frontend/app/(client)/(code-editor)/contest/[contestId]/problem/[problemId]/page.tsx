import { EditorDescription } from '@/app/(client)/(code-editor)/_components/EditorDescription'
import { getContestProblemDetail } from '@/app/(client)/_libs/apis/contestProblem'

export default async function DescriptionPage({
  params
}: {
  params: { problemId: string; contestId: string }
}) {
  const { problemId, contestId } = params

  /**NOTE: already handling error by EditorLayout */
  const { problem, order } = await getContestProblemDetail({
    contestId: Number(contestId),
    problemId: Number(problemId)
  })

  return <EditorDescription problem={{ ...problem, order }} isContest={true} />
}
