'use client'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table'
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
  defaultPageSize?: number
}

export default function DataTableFallback<TData>({
  withSearchBar = true,
  ...props
}: DataTableFallbackProps<TData>) {
  return (
    <>
      {withSearchBar && <Skeleton className="h-10 w-[250px]" />}
      <TableFallback {...props} />
    </>
  )
}

export function TableFallback<TData>({
  columns,
  headerStyle = {},
  defaultPageSize = 10
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
          {Array(defaultPageSize)
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
