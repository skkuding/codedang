'use client'

import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { Skeleton } from '@/components/shadcn/skeleton'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/shadcn/table'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef
} from '@tanstack/react-table'
import { DEFAULT_COLUMN_VISIBILITY } from './constants'

interface DataTableFallbackProps<TData> {
  withSearchBar?: boolean
  columns: ColumnDef<TData, unknown>[]
  headerStyle?: Record<string, string>
  rowCount?: number
}

/**
 * 어드민 테이블의 loading UI 컴포넌트
 * @param withSearchBar
 * 검색창 스켈레톤 포함 여부
 * @param columns
 * header, cell, footer가 정의된 컬럼 목록
 * @param headerStyle
 * header별 tailwind classname을 정의한 객체
 * @param rowCount
 * 스켈레톤을 보여줄 행 개수 (기본값: 10)
 */
export default function DataTableFallback<TData>({
  withSearchBar = true,
  ...props
}: DataTableFallbackProps<TData>) {
  return (
    <div className="space-y-4">
      {withSearchBar && <Skeleton className="h-10 w-[250px]" />}
      <TableFallback {...props} />
    </div>
  )
}

function TableFallback<TData>({
  columns,
  headerStyle = {},
  rowCount = 10
}: Omit<DataTableFallbackProps<TData>, 'withSearchBar'>) {
  const table = useReactTable({
    data: [],
    columns,
    initialState: {
      columnVisibility: DEFAULT_COLUMN_VISIBILITY
    },
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <ScrollArea className="max-w-full rounded border">
      <Table>
        <TableHeader className="bg-neutral-100 [&_tr]:border-b-gray-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className={headerStyle[header.id]}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {Array(rowCount)
            .fill('')
            .map((_, index) => (
              <TableRow key={index}>
                {table.getAllColumns().map(
                  (column) =>
                    column.getIsVisible() && (
                      <TableCell key={column.id} className="md:p-4">
                        <Skeleton className="mx-auto h-[20px] w-full" />
                      </TableCell>
                    )
                )}
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
