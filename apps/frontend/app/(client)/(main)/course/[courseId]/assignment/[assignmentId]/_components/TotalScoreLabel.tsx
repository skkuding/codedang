import type { AssignmentProblemRecord } from '@/types/type'

interface TotalScoreLabelProps {
  record: AssignmentProblemRecord
}

export function TotalScoreLabel({ record }: TotalScoreLabelProps) {
  return (
    <div className="text-primary flex gap-2">
      <div className="border-primary flex h-[31px] w-[125px] items-center justify-center rounded-full border text-lg">
        Total score
      </div>
      <span className="text-xl font-semibold">
        {record?.userAssignmentFinalScore ?? '-'} /{' '}
        {record.assignmentPerfectScore}
      </span>
    </div>
  )
}
