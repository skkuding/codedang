import { useDataTable } from '@/app/admin/_components/table/context'
import { Button } from '@/components/shadcn/button'
import type { BelongedContest } from './BelongedContestTableColumns'

interface SetToZeroButtonProps {
  onRevertScore: () => void
}

export default function RevertScoreButton({
  onRevertScore
}: SetToZeroButtonProps) {
  const { table } = useDataTable<BelongedContest>()

  const selectedContests = table.getSelectedRowModel().rows

  return (
    <>
      {selectedContests.length > 0 && (
        <Button
          onClick={() => {
            table.resetRowSelection()
            onRevertScore()
          }}
          variant="filter"
          className="ml-3"
        >
          Revert Score
        </Button>
      )}
    </>
  )
}
