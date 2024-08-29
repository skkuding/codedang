import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import type { Table } from '@tanstack/react-table'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  showRowsPerPage?: boolean
}

function pageArray(m: number, n: number): number[] {
  return Array(n - m + 1)
    .fill(0)
    .map((_, i) => m + i)
}

export function DataTablePagination<TData>({
  table,
  showRowsPerPage = true
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-muted-foreground text-xs text-neutral-600">
        {table.getColumn('select') &&
          `${table.getFilteredSelectedRowModel().rows.length} of${' '}
          ${table.getFilteredRowModel().rows.length} row(s) selected`}
      </div>
      <div className="absolute left-1/2 flex -translate-x-1/2 transform gap-5">
        <button
          className={cn(
            '-mr-1',
            table.getCanPreviousPage() ? 'text-neutral-600' : 'text-neutral-300'
          )}
          onClick={() => {
            table.previousPage()
          }}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        {pageArray(
          Math.floor(table.getState().pagination.pageIndex / 10) * 10 + 1,
          Math.min(
            Math.ceil(
              table.getFilteredRowModel().rows.length /
                table.getState().pagination.pageSize
            ),
            Math.floor(table.getState().pagination.pageIndex / 10) * 10 + 10
          )
        ).map((pageNumber) => (
          <button
            className={cn(
              'font-mono text-sm font-medium',
              table.getState().pagination.pageIndex + 1 === pageNumber &&
                'text-primary'
            )}
            key={pageNumber}
            onClick={() => {
              table.setPageIndex(pageNumber - 1)
            }}
          >
            {pageNumber}
          </button>
        ))}
        <button
          className={cn(
            '-ml-1',
            table.getCanNextPage() ? 'text-neutral-600' : 'text-neutral-300'
          )}
          onClick={() => {
            table.nextPage()
          }}
          disabled={!table.getCanNextPage()}
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
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
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
