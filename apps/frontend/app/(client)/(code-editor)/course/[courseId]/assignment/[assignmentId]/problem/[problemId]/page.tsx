import { EditorDescription } from '@/app/(client)/(code-editor)/_components/EditorDescription'
import type { GetAssignmentProblemDetailResponse } from '@/app/(client)/_libs/apis/assignmentProblem'
import { fetcherWithAuth } from '@/libs/utils'
import { redirect } from 'next/navigation'

export default async function DescriptionPage({
  params
}: {
  params: { problemId: string; assignmentId: string; courseId: string }
}) {
  const { problemId, assignmentId, courseId } = params

  // TODO: use `getAssignmentProblemDetail` from _libs/apis folder & use error boundary
  const res = await fetcherWithAuth(
    `assignment/${assignmentId}/problem/${problemId}`
  )
  if (!res.ok && res.status === 403) {
    redirect(
      `/course/${courseId}/assignment/${assignmentId}/finished/problem/${problemId}`
    )
  }

  const { problem, order } =
    await res.json<GetAssignmentProblemDetailResponse>()

  return <EditorDescription problem={{ ...problem, order }} />
}
