import { useDataTable } from '@/app/admin/_components/table/context'
import { Button } from '@/components/ui/button'
import type { BelongedContest } from './BelongedContestTableColumns'

interface SetToZeroButtonProps {
  onSetToZero: (data: number[]) => void
}

export default function ImportProblemButton({
  onSetToZero
}: SetToZeroButtonProps) {
  const { table } = useDataTable<BelongedContest>()

  const selectedContests = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.id)

  return (
    <>
      {selectedContests.length && (
        <Button
          onClick={() => onSetToZero(selectedContests)}
          className="ml-auto"
        >
          Set to Zero
        </Button>
      )}
    </>
  )
}
