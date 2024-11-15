import { useDataTable } from '@/app/admin/_components/table/context'
import { Button } from '@/components/ui/button'
import type { BelongedContest } from './BelongedContestTableColumns'

interface SetToZeroButtonProps {
  onSetToZero: (data: number[]) => void
}

export default function SetToZeroButton({ onSetToZero }: SetToZeroButtonProps) {
  const { table } = useDataTable<BelongedContest>()

  const selectedContests = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.id)

  return (
    <>
      {selectedContests.length > 0 && (
        <Button onClick={() => onSetToZero(selectedContests)} variant="outline">
          Set to Zero
        </Button>
      )}
    </>
  )
}
