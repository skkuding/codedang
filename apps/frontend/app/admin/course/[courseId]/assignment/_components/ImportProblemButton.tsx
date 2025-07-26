import { useDataTable } from '@/app/admin/_components/table/context'
import { Button } from '@/components/shadcn/button'
import { HiCheckCircle } from 'react-icons/hi2'
import type { AssignmentProblem } from '../../_libs/type'
import type { DataTableProblem } from './ImportProblemTableColumns'

interface ImportProblemButtonProps {
  onSelectedExport: (data: AssignmentProblem[]) => void
}

export function ImportProblemButton({
  onSelectedExport
}: ImportProblemButtonProps) {
  const { table } = useDataTable<DataTableProblem>()

  const handleImportProblems = () => {
    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original)

    const problems = selectedRows
      .map((problem) => ({
        ...problem,
        score: problem?.score ?? 0,
        order: problem?.order ?? Number.MAX_SAFE_INTEGER
      }))
      .sort((a, b) => a.order - b.order)

    let order = 0
    const exportedProblems = problems.map((problem, index, arr) => {
      if (
        index > 0 &&
        // NOTE: 만약 현재 요소가 새로 추가된 문제이거나 새로 추가된 문제가 아니라면 이전 문제와 기존 순서가 다를 때
        (arr[index].order === Number.MAX_SAFE_INTEGER ||
          arr[index - 1].order !== arr[index].order)
      ) {
        order++
      }
      return {
        ...problem,
        order
      }
    })
    onSelectedExport(exportedProblems)
  }

  return (
    <Button
      onClick={handleImportProblems}
      className="h-[36px] w-[120px] gap-[8px] p-[8px]"
    >
      <HiCheckCircle className="text-sm" />
      <span className="text-sm">Import</span>
    </Button>
  )
}
