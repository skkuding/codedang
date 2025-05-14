import {
  DataTable,
  DataTableFallback,
  DataTableLangFilter,
  DataTableLevelFilter,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { GET_PROBLEMS } from '@/graphql/problem/queries'
import { useSuspenseQuery } from '@apollo/client'
import { Language, Level } from '@generated/graphql'
import { toast } from 'sonner'
import type { AssignmentProblem } from '../_libs/type'
import { ImportProblemButton } from './ImportProblemButton'
import {
  columns,
  DEFAULT_PAGE_SIZE,
  ERROR_MESSAGE,
  MAX_SELECTED_ROW_COUNT
} from './ImportProblemTableColumns'

export function ImportProblemTable({
  checkedProblems,
  onSelectedExport
}: {
  checkedProblems: AssignmentProblem[]
  onSelectedExport: (selectedRows: AssignmentProblem[]) => void
}) {
  const queryVariables = {
    take: 500,
    input: {
      difficulty: [
        Level.Level1,
        Level.Level2,
        Level.Level3,
        Level.Level4,
        Level.Level5
      ],
      languages: [Language.C, Language.Cpp, Language.Java, Language.Python3]
    }
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

  const combinedProblems = [...myData.getProblems, ...sharedData.getProblems]

  const uniqueProblemsMap = new Map()
  combinedProblems.forEach((problem) => {
    uniqueProblemsMap.set(problem.id, problem)
  })

  const problems = Array.from(uniqueProblemsMap.values()).map((problem) => ({
    ...problem,
    id: Number(problem.id),
    isVisible: problem.isVisible !== undefined ? problem.isVisible : null,
    languages: problem.languages ?? [],
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
      <div className="flex gap-4">
        <DataTableSearchBar columndId="title" />
        <DataTableLangFilter />
        <DataTableLevelFilter />
        <ImportProblemButton onSelectedExport={onSelectedExport} />
      </div>
      <DataTable
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
      <DataTablePagination showSelection showRowsPerPage={false} />
    </DataTableRoot>
  )
}

export function ImportProblemTableFallback() {
  return <DataTableFallback columns={columns} rowCount={DEFAULT_PAGE_SIZE} />
}
