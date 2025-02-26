import { KatexContent } from '@/components/KatexContent'
import { safeFetcherWithAuth } from '@/libs/utils'
import type { Assignment } from '@/types/type'

interface AssignmentInfoProps {
  params: {
    courseId: string
    assignmentId: string
  }
}

export default async function AssginmentInfo({ params }: AssignmentInfoProps) {
  const { assignmentId } = params

  const res = await safeFetcherWithAuth.get(`assignment/${assignmentId}`)

  const assignment: Assignment = await res.json()
  const description = assignment.description

  return (
    <div className="flex flex-col gap-10">
      <div className="bg-primary w-fit rounded-full px-3 py-2 text-xs text-white">
        Assignment Description
      </div>
      <KatexContent content={description} />
    </div>
  )
}
