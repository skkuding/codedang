import { useDataTable } from '@/app/admin/_components/table/context'
import { Button } from '@/components/shadcn/button'
import { useTranslate } from '@tolgee/react'
import type { BelongedContest } from './BelongedContestTableColumns'

interface SetToZeroButtonProps {
  onSetToZero: (data: number[]) => void
}

export function SetToZeroButton({ onSetToZero }: SetToZeroButtonProps) {
  const { t } = useTranslate()
  const { table } = useDataTable<BelongedContest>()

  const selectedContests = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.id)

  return selectedContests.length > 0 ? (
    <Button onClick={() => onSetToZero(selectedContests)} variant="outline">
      {t('set_to_zero_button')}
    </Button>
  ) : null
}
