import { useDataTable } from '@/app/admin/_components/table/context'
import { Button } from '@/components/shadcn/button'
import { useTranslate } from '@tolgee/react'
import type { BelongedContest } from './BelongedContestTableColumns'

interface SetToZeroButtonProps {
  onRevertScore: () => void
}

export function RevertScoreButton({ onRevertScore }: SetToZeroButtonProps) {
  const { table } = useDataTable<BelongedContest>()
  const { t } = useTranslate()

  const selectedContests = table.getSelectedRowModel().rows

  return selectedContests.length > 0 ? (
    <Button
      onClick={() => {
        table.resetRowSelection()
        onRevertScore()
      }}
      variant="filter"
      className="ml-3"
    >
      {t('revert_score_button')}
    </Button>
  ) : null
}
