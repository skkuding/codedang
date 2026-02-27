import { getTranslate } from '@/tolgee/server'
import type { AssignmentProblemRecord } from '@/types/type'

interface TotalScoreLabelProps {
  record: AssignmentProblemRecord
}

export async function TotalScoreLabel({ record }: TotalScoreLabelProps) {
  const t = await getTranslate()
  return (
    <div className="text-primary flex gap-2">
      <div className="border-primary flex h-[31px] w-[125px] items-center justify-center rounded-full border text-lg">
        {t('total_score_label')}
      </div>
      <span className="text-xl font-semibold">
        {record?.userAssignmentFinalScore ?? '-'} /{' '}
        {record.assignmentPerfectScore}
      </span>
    </div>
  )
}
