import { ImportProblemDescription } from '@/app/admin/_components/ImportProblemDescription'
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
import type { AssignmentProblem } from '../../_libs/type'
import { ImportProblemButton } from './ImportProblemButton'
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
      shared: false,
      my: true
    }
  })

  // 공유된 문제 가져오기
  const { data: sharedData } = useSuspenseQuery(GET_PROBLEMS, {
    variables: {
      ...queryVariables,
      shared: true,
      my: false
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
      <ImportProblemDescription />
      <div className="flex gap-[6px] pb-1">
        <DataTableSearchBar columndId="title" className="lg:w-[308px]" />
        <DataTableLangFilter />
        <DataTableLevelFilter />
      </div>
      <DataTable
        isModalDataTable={true}
        headerStyle={{
          select: 'rounded-l-full',
          preview: 'rounded-r-full'
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
      <div className="h-[12px]" />
      <DataTablePagination showRowsPerPage={false} />
      <div className="h-[20px]" />
      <ImportProblemButton onSelectedExport={onSelectedExport} />
    </DataTableRoot>
  )
}

export function ImportProblemTableFallback() {
  return <DataTableFallback columns={columns} rowCount={DEFAULT_PAGE_SIZE} />
}
