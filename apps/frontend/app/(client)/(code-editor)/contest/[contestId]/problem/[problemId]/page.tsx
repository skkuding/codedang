import { EditorDescription } from '@/app/(client)/(code-editor)/_components/EditorDescription'
import type { GetContestProblemDetailResponse } from '@/app/(client)/_libs/apis/contestProblem'
import { fetcherWithAuth } from '@/libs/utils'
import { redirect } from 'next/navigation'

export default async function DescriptionPage({
  params
}: {
  params: { problemId: string; contestId: string }
}) {
  const { problemId, contestId } = params

  // TODO: use `getContestProblemDetail` from _libs/apis folder & use error boundary
  const res = await fetcherWithAuth(`contest/${contestId}/problem/${problemId}`)
  if (!res.ok && res.status === 403) {
    redirect(`/contest/${contestId}/finished/problem/${problemId}`)
  }

  const { problem, order } = await res.json<GetContestProblemDetailResponse>()

  return <EditorDescription problem={{ ...problem, order }} isContest={true} />
}
