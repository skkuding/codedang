import { EditorDescription } from '@/components/EditorDescription'
import { fetcherWithAuth } from '@/lib/utils'
import type { ContestProblem, ProblemDetail } from '@/types/type'
import { redirect } from 'next/navigation'

export default async function DescriptionPage({
  params
}: {
  params: { problemId: number; contestId: number }
}) {
  const { problemId, contestId } = params
  const res = await fetcherWithAuth(`contest/${contestId}/problem/${problemId}`)

  if (!res.ok && res.status === 403) {
    redirect(`/contest/${contestId}/finished/problem/${problemId}`)
  }

  const contestProblem: { problem: ProblemDetail } = await res.json()

  const contestProblems: { problems: ContestProblem[] } = await fetcherWithAuth(
    `contest/${params.contestId}/problem`
  ).json()
  return (
    <EditorDescription
      problem={contestProblem.problem}
      contestProblems={contestProblems.problems}
      isContest={true}
    />
  )
}
