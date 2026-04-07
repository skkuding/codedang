'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { cn, getPageArray } from '@/libs/utils'
import { FaCirclePlay } from 'react-icons/fa6'
import { useDataTable } from './context'

interface DataTablePaginationProps {
  showSelection?: boolean
  showRowsPerPage?: boolean
}

/**
 * 어드민 테이블의 페이지네이션 컴포넌트
 * @param showSelection
 * 몇개의 row가 선택되었는지 보여주는 텍스트 표시 여부 (기본값: false)
 * @param showRowsPerPage
 * 페이지당 보여줄 행을 선택하는 셀렉트 박스 표시 여부 (기본값: true)
 */
export function DataTablePagination({
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
    <div className="relative flex items-center justify-between px-2">
      <div className="flex items-center text-xs text-neutral-600">
        {showSelection &&
          `${table.getFilteredSelectedRowModel().rows.length} of${' '}
          ${table.getFilteredRowModel().rows.length} row(s) selected`}
      </div>
      <div className="absolute left-1/2 flex -translate-x-1/2 transform gap-[33px]">
        <button
          type="button"
          className="mr-[10px] flex items-center justify-center text-neutral-600 disabled:text-neutral-300"
          disabled={!table.getCanPreviousPage()}
          onClick={() => {
            table.previousPage()
          }}
        >
          {!table.getCanPreviousPage() && (
            <div className="absolute z-0 h-6 w-6 rounded-full bg-[#C4C4C4]" />
          )}
          <FaCirclePlay
            color={table.getCanPreviousPage() ? '#3581FA' : '#EBEBEB'}
            className="z-10 h-6 w-6 rotate-180"
          />
        </button>
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={cn(
              'text-base font-medium text-[#8A8A8A]',
              table.getState().pagination.pageIndex === pageNumber - 1 &&
                'text-primary-strong'
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
          className="ml-[10px] flex items-center justify-center text-neutral-600 disabled:text-neutral-300"
          disabled={!table.getCanNextPage()}
          onClick={() => {
            table.nextPage()
          }}
        >
          {!table.getCanNextPage() && (
            <div className="absolute z-0 h-6 w-6 rounded-full bg-[#C4C4C4]" />
          )}
          <FaCirclePlay
            color={table.getCanNextPage() ? '#3581FA' : '#EBEBEB'}
            className="z-10 h-6 w-6"
          />
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
