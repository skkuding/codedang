import { KatexContent } from '@/components/KatexContent'
import { auth } from '@/libs/auth'
import { fetcher, fetcherWithAuth } from '@/libs/utils'
import type { Assignment } from '@/types/type'

interface AssignmentInfoProps {
  params: {
    assignmentId: string
  }
}

export default async function AssginmentInfo({ params }: AssignmentInfoProps) {
  const session = await auth()
  const { assignmentId } = params

  const res = await (session ? fetcherWithAuth : fetcher).get(
    `assignment/${assignmentId}`
  )

  if (!res.ok) {
    throw new Error('Failed to fetch assignment')
  }

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
