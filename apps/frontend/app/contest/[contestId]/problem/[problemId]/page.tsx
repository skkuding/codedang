import { EditorDescription } from '@/components/EditorDescription'
import { fetcherWithAuth } from '@/lib/utils'
import type { ContestProblem, ProblemDetail } from '@/types/type'

export default async function DescriptionPage({
  params
}: {
  params: { problemId: number; contestId: number }
}) {
  const { problemId, contestId } = params
  const contestProblem: { problem: ProblemDetail } = await fetcherWithAuth(
    `contest/${contestId}/problem/${problemId}`
  ).json()
  const contestProblems: { problems: ContestProblem[] } = await fetcherWithAuth(
    `contest/${params.contestId}/problem`
  ).json()
  return (
    <EditorDescription
      problem={contestProblem.problem}
      contestProblems={contestProblems.problems}
    />
  )
}
