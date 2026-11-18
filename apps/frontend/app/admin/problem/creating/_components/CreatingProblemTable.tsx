import type { Route } from 'next'
import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot
} from '../../../_components/table'
import { SearchInputSync } from '../../_components/SearchInputSync'
import { useInProgressMandeuldangProblems } from '../_libs/useInProgressMandeuldangProblems'
import { columns } from './CreatingProblemTableColumns'

export function CreatingProblemTable() {
  const problems = useInProgressMandeuldangProblems()
  const bodyStyle = { title: 'justify-start' }

  return (
    <DataTableRoot
      data={problems}
      columns={columns}
      className="contents space-y-0"
      defaultSortState={[{ id: 'updateTime', desc: true }]}
    >
      <SearchInputSync />
      <div className="w-full space-y-4">
        <DataTable
          // TODO: 만들당 문제 id 라우트 생성 후 교체
          getHref={(data) =>
            `/admin/problem/mandeuldang?problemId=${data.id}` as Route
          }
          bodyStyle={bodyStyle}
        />
        <DataTablePagination />
      </div>
    </DataTableRoot>
  )
}

export function CreatingProblemTableFallback() {
  return (
    <div className="w-full">
      <DataTableFallback columns={columns} withSearchBar={false} />
    </div>
  )
}
