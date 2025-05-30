'use client'

import { Input } from '@/components/shadcn/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { cn } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { Route } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  headerStyle: {
    [key: string]: string
  }
  problemId: number
}

/**
 * @param columns
 * columns to be displayed
 * @param data
 * data to be displayed
 * @param headerStyle
 * tailwindcss class name for each header
 * @param name
 * name of the table, used for routing
 * @example
 * ```tsx
 * // page.tsx
 * <DataTable data={data} columns={columns} headerStyle={{
 *  title: 'text-left w-2/4 md:w-4/6',
 *  createdBy: 'w-1/4 md:w-1/6',
 *  createTime: 'w-1/4 md:w-1/6'
 *  }}
 *  name="notice"
 * />
 * ```
 * ```tsx
 * // _components/Columns.tsx
 * import type { Notice } from '@/types/type'
 * export const columns: ColumnDef<Notice, string>[] = [
 *  {
 *    header: 'Title',
 *    accessorKey: 'title',
 *    cell: (row) => row.original.title,
 *  },
 *  ...
 * ]
 * ```
 */

interface Item {
  id: number | string
}

export function DataTable<TData extends Item, TValue>({
  columns,
  data,
  headerStyle,
  problemId
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  })
  const router = useRouter()

  return (
    <div>
      <Input
        placeholder="Search User"
        value={(table.getColumn('username')?.getFilterValue() as string) ?? ''}
        onChange={(event) => {
          table.getColumn('username')?.setFilterValue(event.target.value)
        }}
        className="h-10 w-[150px] lg:w-[250px]"
      />
      <Table className="table-fixed">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="hover:bg-gray-200/40" key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'border-b border-gray-400 text-center text-xs font-semibold',
                      headerStyle[header.id]
                    )}
                    style={{ padding: 0 }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const href =
                `/problem/${problemId}/submission/${row.original.id}` as Route
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="cursor-pointer border-t border-gray-400 hover:bg-gray-200/40 hover:font-semibold"
                  onClick={() => {
                    router.push(href)
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        paddingTop: 10,
                        paddingBottom: 10,
                        paddingLeft: 2,
                        paddingRight: 2
                      }}
                    >
                      <div className="text-center text-xs">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                      {/* for prefetch */}
                      <Link href={href} />
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          ) : (
            <TableRow className="hover:bg-gray-200/40">
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
