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
import { GET_PROBLEMS } from '@/graphql/problem/queries'
import { useSuspenseQuery } from '@apollo/client'
import { Language, Level } from '@generated/graphql'
import { useTranslate } from '@tolgee/react'
import { toast } from 'sonner'
import type { AssignmentProblem } from '../../_libs/type'
import {
  getColumns,
  DEFAULT_PAGE_SIZE,
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
  const { t } = useTranslate()
  const columns = getColumns(t)
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
    updateTime: problem.updateContentTime ?? problem.updateTime,
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
      <ImportProblemDescription />
      <div className="flex justify-between">
        <div className="flex gap-[8px]">
          <DataTableSearchBar
            columndId="title"
            size="sm"
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
            toast.error(
              t('import_problem_error_message', {
                count: MAX_SELECTED_ROW_COUNT
              })
            )
          }
        }}
      />
      <div className="h-1.5" />
      <DataTablePagination showRowsPerPage={false} />
    </DataTableRoot>
  )
}

export function ImportProblemTableFallback() {
  return (
    <DataTableFallback
      columns={getColumns(() => '')}
      rowCount={DEFAULT_PAGE_SIZE}
    />
  )
}
