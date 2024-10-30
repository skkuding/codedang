import { Button } from '@/components/ui/button'
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
import { useDataTable } from '../../_components/table/context'
import type { ContestProblem } from '../utils'
import {
  columns,
  DEFAULT_PAGE_SIZE,
  ERROR_MESSAGE,
  MAX_SELECTED_ROW_COUNT,
  type DataTableProblem
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
          } else {
            toast.error(ERROR_MESSAGE)
          }
        }}
      />
      <DataTablePagination showSelection showRowsPerPage={false} />
    </DataTableRoot>
  )
}

interface ImportProblemButtonProps {
  onSelectedExport: (data: ContestProblem[]) => void
}

function ImportProblemButton({ onSelectedExport }: ImportProblemButtonProps) {
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
    <Button onClick={handleImportProblems} className="ml-auto">
      Import / Edit
    </Button>
  )
}

export function ImportProblemTableFallback() {
  return <DataTableFallback columns={columns} rowCount={DEFAULT_PAGE_SIZE} />
}
