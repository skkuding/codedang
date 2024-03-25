import { EditorDescription } from '@/components/EditorDescription'
import { fetcher, fetcherWithAuth } from '@/lib/utils'
import type { ContestProblem, ProblemDetail } from '@/types/type'

export default async function DescriptionPage({
  params
}: {
  params: { problemId: number; contestId: number }
}) {
  const { problemId } = params
  const problem: ProblemDetail = await fetcher(`problem/${problemId}`).json()
  const contestProblems: { problems: ContestProblem[] } = await fetcherWithAuth(
    `contest/${params.contestId}/problem`
  ).json()
  return (
    <EditorDescription
      problem={problem}
      contestProblems={contestProblems.problems}
    />
  )
}
