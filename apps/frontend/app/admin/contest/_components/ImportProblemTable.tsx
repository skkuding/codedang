import { GET_PROBLEMS } from '@/graphql/problem/queries'
import { useSuspenseQuery } from '@apollo/client'
import { Language, Level } from '@generated/graphql'
import { toast } from 'sonner'
import {
  DataTable,
  DataTableFallback,
  DataTableLangFilter,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '../../_components/table'
import type { ContestProblem } from '../_libs/schemas'
import { ImportProblemButton } from './ImportProblemButton'
import { ImportProblemDescription } from './ImportProblemDescription'
import {
  columns,
  DEFAULT_PAGE_SIZE,
  ERROR_MESSAGE,
  MAX_SELECTED_ROW_COUNT
} from './ImportProblemTableColumns'

interface ImportProblemTableProps {
  checkedProblems: ContestProblem[]
  onSelectedExport: (selectedRows: ContestProblem[]) => void
  contestId?: string | null
}

export function ImportProblemTable({
  checkedProblems,
  onSelectedExport,
  contestId = null
}: ImportProblemTableProps) {
  const { data } = useSuspenseQuery(GET_PROBLEMS, {
    variables: {
      my: true,
      contestId: contestId ? Number(contestId) : null,
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
      id: Number(id),
      tag: {
        ...tag,
        id: Number(tag.id)
      }
    })),
    score:
      checkedProblems.find((item) => item.id === Number(problem.id))?.score ??
      1,
    order: checkedProblems.find((item) => item.id === Number(problem.id))
      ?.order,
    createdBy: problem.createdBy?.username ? problem.createdBy.username : ''
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
      <div className="flex gap-[6px] pb-1">
        <DataTableSearchBar columndId="title" className="lg:w-[308px]" />
        <DataTableLangFilter />
      </div>
      <DataTable
        isModalDataTable={true}
        headerStyle={{
          select: 'rounded-l-full',
          difficulty: 'rounded-r-full'
        }}
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
      <div className="h-5" />
      <DataTablePagination showRowsPerPage={false} />
      <div className="h-7" />
      <ImportProblemButton onSelectedExport={onSelectedExport} />
    </DataTableRoot>
  )
}

export function ImportProblemTableFallback() {
  return <DataTableFallback columns={columns} rowCount={DEFAULT_PAGE_SIZE} />
}
