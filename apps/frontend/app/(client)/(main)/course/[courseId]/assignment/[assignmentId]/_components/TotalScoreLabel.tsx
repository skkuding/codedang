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
      <span className="text-title1_sb_20">
        {record?.userAssignmentFinalScore ?? '-'} /{' '}
        {record.assignmentPerfectScore}
      </span>
    </div>
  )
}
