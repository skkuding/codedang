import { GET_PROBLEMS } from '@/graphql/problem/queries'
import { useSuspenseQuery } from '@apollo/client'
import { Language, Level } from '@generated/graphql'
import { useTranslate } from '@tolgee/react'
import { toast } from 'sonner'
import { ImportProblemButton } from '../../_components/ImportProblemButton'
import { ImportProblemDescription } from '../../_components/ImportProblemDescription'
import {
  DataTable,
  DataTableFallback,
  DataTableLangFilter,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '../../_components/table'
import type { ContestProblem } from '../_libs/schemas'
import {
  getColumns,
  DEFAULT_PAGE_SIZE,
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
  const { t } = useTranslate()
  const columns = getColumns(t)

  const { data } = useSuspenseQuery(GET_PROBLEMS, {
    variables: {
      mode: 'contest',
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
      <div className="flex justify-between">
        <div className="flex gap-[8px]">
          <DataTableSearchBar
            columndId="title"
            size="sm"
            className="w-[322px]!"
          />
          <DataTableLangFilter />
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
      <div className="h-[12px]" />
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
