import { useDataTable } from '@/app/admin/_components/table/context'
import { Button } from '@/components/ui/button'
import type { BelongedContest } from './BelongedContestTableColumns'

export default function ImportProblemButton() {
  const { table } = useDataTable<BelongedContest>()

  const setToZero = () => {
    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original)
    console.log(selectedRows)
  }

  return (
    <Button onClick={setToZero} className="ml-auto">
      Set to Zero
    </Button>
  )
}
