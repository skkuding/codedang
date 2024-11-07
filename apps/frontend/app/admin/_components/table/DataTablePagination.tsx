'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from '@/libs/utils'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { useDataTable } from './context'

interface DataTablePaginationProps {
  showSelection?: boolean
  showRowsPerPage?: boolean
}

function getPageArray(start: number, end: number) {
  return Array(end - start + 1)
    .fill(0)
    .map((_, i) => start + i)
}

/**
 * 어드민 테이블의 페이지네이션 컴포넌트
 * @param showSelection
 * 몇개의 row가 선택되었는지 보여주는 텍스트 표시 여부 (기본값: false)
 * @param showRowsPerPage
 * 페이지당 보여줄 행을 선택하는 셀렉트 박스 표시 여부 (기본값: true)
 */
export default function DataTablePagination({
  showSelection = false,
  showRowsPerPage = true
}: DataTablePaginationProps) {
  const { table } = useDataTable()

  const pages = getPageArray(
    Math.floor(table.getState().pagination.pageIndex / 10) * 10 + 1,
    Math.min(
      Math.ceil(
        table.getFilteredRowModel().rows.length /
          table.getState().pagination.pageSize
      ),
      Math.floor(table.getState().pagination.pageIndex / 10) * 10 + 10
    )
  )

  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-xs text-neutral-600">
        {showSelection &&
          `${table.getFilteredSelectedRowModel().rows.length} of${' '}
          ${table.getFilteredRowModel().rows.length} row(s) selected`}
      </div>
      <div className="absolute left-1/2 flex -translate-x-1/2 transform gap-5">
        <button
          type="button"
          className="-mr-1 text-neutral-600 disabled:text-neutral-300"
          disabled={!table.getCanPreviousPage()}
          onClick={() => {
            table.previousPage()
          }}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={cn(
              'font-mono text-sm font-medium',
              table.getState().pagination.pageIndex === pageNumber - 1 &&
                'text-primary'
            )}
            onClick={() => {
              table.setPageIndex(pageNumber - 1)
            }}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          className="-ml-1 text-neutral-600 disabled:text-neutral-300"
          disabled={!table.getCanNextPage()}
          onClick={() => {
            table.nextPage()
          }}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        {showRowsPerPage && (
          <div className="flex items-center space-x-2">
            <p className="text-xs text-neutral-600">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-6 w-14 bg-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top" className="bg-white">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  )
}
