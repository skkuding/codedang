import { GET_PROBLEMS } from '@/graphql/problem/queries'
import { useSuspenseQuery } from '@apollo/client'
import { Language, Level } from '@generated/graphql'
import { toast } from 'sonner'
import DataTable from '../../_components/table/DataTable'
import DataTableFallback from '../../_components/table/DataTableFallback'
import DataTableLangFilter from '../../_components/table/DataTableLangFilter'
import DataTableLevelFilter from '../../_components/table/DataTableLevelFilter'
import DataTablePagination from '../../_components/table/DataTablePagination'
import DataTableRoot from '../../_components/table/DataTableRoot'
import DataTableSearchBar from '../../_components/table/DataTableSearchBar'
import type { ContestProblem } from '../utils'
import ImportProblemButton from './ImportProblemButton'
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
  checkedProblems: ContestProblem[]
  onSelectedExport: (selectedRows: ContestProblem[]) => void
}) {
  const { data } = useSuspenseQuery(GET_PROBLEMS, {
    variables: {
      groupId: 1,
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
  })

  const problems = data.getProblems.map((problem) => ({
    ...problem,
    id: Number(problem.id),
    isVisible: problem.isVisible !== undefined ? problem.isVisible : null,
    languages: problem.languages ?? [],
    tag: problem.tag.map(({ id, tag }) => ({
      id: +id,
      tag: {
        ...tag,
        id: Number(tag.id)
      }
    })),
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
