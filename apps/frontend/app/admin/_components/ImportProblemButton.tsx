import { useDataTable } from '@/app/admin/_components/table/context'
import { Button } from '@/components/shadcn/button'
import { HiCheckCircle } from 'react-icons/hi'
import type { ContestProblem } from '../contest/_libs/schemas'
import type { AssignmentProblem } from '../course/[courseId]/_libs/type'

interface ImportProblemButtonProps<T> {
  onSelectedExport: (data: T[]) => void
}

export function ImportProblemButton<
  T extends AssignmentProblem | ContestProblem
>({ onSelectedExport }: ImportProblemButtonProps<T>) {
  const { table } = useDataTable<T>()

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
      <HiCheckCircle className="text-body4_r_14" />
      <span className="text-body4_r_14">Import</span>
    </Button>
  )
}
