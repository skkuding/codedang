// import { ImportProblemButton } from './ImportProblemButton'
import { ImportProblemButton } from '@/app/admin/_components/ImportProblemButton'
import { ImportProblemDescription } from '@/app/admin/_components/ImportProblemDescription'
import {
  DataTable,
  DataTableFallback,
  DataTableLevelFilter,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import {
  PROBLEM_IMPORT_FILTER,
  uniqueProblems
} from '@/app/admin/_libs/problemImport'
import { GET_PROBLEMS } from '@/graphql/problem/queries'
import { useSuspenseQuery } from '@apollo/client'
import { toast } from 'sonner'
import type { AssignmentProblem } from '../../../_libs/type'
import {
  columns,
  DEFAULT_PAGE_SIZE,
  ERROR_MESSAGE,
  MAX_SELECTED_ROW_COUNT
} from './ImportProblemTableColumns'

interface ImportProblemTableProps {
  checkedProblems: AssignmentProblem[]
  onSelectedExport: (selectedRows: AssignmentProblem[]) => void
}

export function ImportProblemTable({
  checkedProblems,
  onSelectedExport
}: ImportProblemTableProps) {
  const queryVariables = {
    take: 500,
    input: PROBLEM_IMPORT_FILTER
  }

  const { data: myData } = useSuspenseQuery(GET_PROBLEMS, {
    variables: {
      ...queryVariables,
      mode: 'my'
    }
  })

  // 공유된 문제 가져오기
  const { data: sharedData } = useSuspenseQuery(GET_PROBLEMS, {
    variables: {
      ...queryVariables,
      mode: 'shared'
    }
  })

  const problems = uniqueProblems([
    ...myData.getProblems,
    ...sharedData.getProblems
  ]).map((problem) => ({
    ...problem,
    id: Number(problem.id),
    isVisible: problem.isVisible !== undefined ? problem.isVisible : null,
    updateTime: problem.updateContentTime ?? problem.updateTime,
    languages: problem.languages ?? [],
    solution: problem.solution ?? [],
    solutionReleaseTime:
      checkedProblems.find((item) => item.id === Number(problem.id))
        ?.solutionReleaseTime ?? null,
    score: checkedProblems.find((item) => item.id === Number(problem.id))
      ?.score,
    order: checkedProblems.find((item) => item.id === Number(problem.id))?.order
  }))

  const selectedProblemIds = checkedProblems.map((problem) => problem.id)

  return (
    <DataTableRoot
      data={problems}
      columns={columns}
      selectedRowIds={selectedProblemIds}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      defaultSortState={[{ id: 'select', desc: true }]}
    >
      <ImportProblemDescription />
      <div className="flex justify-between">
        <div className="flex gap-[8px]">
          <DataTableSearchBar
            columndId="title"
            sizeVariant="sm"
            className="w-[322px]! ring-inset"
          />
          <DataTableLevelFilter />
        </div>
        <ImportProblemButton onSelectedExport={onSelectedExport} />
      </div>
      <DataTable
        size="sm"
        isHeaderGrouped={true}
        onRowClick={(table, row) => {
          const selectedRowCount = table.getSelectedRowModel().rows.length
          if (
            selectedRowCount < MAX_SELECTED_ROW_COUNT ||
            row.getIsSelected()
          ) {
            row.toggleSelected()
            table.setSorting([{ id: 'select', desc: true }]) // NOTE: force to trigger sortingFn
          } else {
            toast.error(ERROR_MESSAGE)
          }
        }}
      />
      <div className="h-1.5" />
      <DataTablePagination showRowsPerPage={false} />
    </DataTableRoot>
  )
}

export function ImportProblemTableFallback() {
  return <DataTableFallback columns={columns} rowCount={DEFAULT_PAGE_SIZE} />
}
