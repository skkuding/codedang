import type { GetAssignmentProblemDetailResponse } from '@/app/(client)/_libs/apis/assignmentProblem'
import { fetcherWithAuth } from '@/libs/utils'
import type { Language } from '@/types/type'
import { redirect } from 'next/navigation'
import { SolutionLayout } from './_components/SolutionLayout'

interface Solution {
  code: string
  language: Language
}

export default async function SolutionPage({
  params
}: {
  params: { problemId: string; assignmentId: string; courseId: string }
}) {
  const { problemId, assignmentId, courseId } = params

  const res = await fetcherWithAuth(
    `assignment/${assignmentId}/problem/${problemId}`
  )
  if (!res.ok && res.status === 403) {
    redirect(
      `/course/${courseId}/assignment/${assignmentId}/finished/problem/${problemId}`
    )
  }

  const { problem } = await res.json<GetAssignmentProblemDetailResponse>()

  // solution이 null이거나 아직 공개되지 않은 경우 안내 메시지
  if (
    !problem.solution ||
    problem.solution.length === 0 ||
    problem.solution[0] === null
  ) {
    return (
      <div className="py-8 text-center text-lg text-gray-400">
        Solution is not available yet.
      </div>
    )
  }

  // 이미 파싱된 객체 배열이므로 바로 넘김
  return (
    <div className="py-8">
      <SolutionLayout
        solution={problem.solution as Solution[]}
        languages={problem.languages}
      />
    </div>
  )
}
