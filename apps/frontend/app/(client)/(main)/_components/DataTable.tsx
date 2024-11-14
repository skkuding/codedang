'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface Item {
  id: number
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  headerStyle: {
    [key: string]: string
  }
  linked?: boolean
  emptyMessage?: string
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
 * @param linked
 * if true, each row is linked to the detail page
 * @example
 * ```tsx
 * // page.tsx
 * <DataTable data={data} columns={columns} headerStyle={{
 *  title: 'text-left w-2/4 md:w-4/6',
 *  createdBy: 'w-1/4 md:w-1/6',
 *  createTime: 'w-1/4 md:w-1/6'
 *  }}
 *  name="notice"
 * linked # for routing
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

export default function DataTable<TData extends Item, TValue>({
  columns,
  data,
  headerStyle,
  linked = false,
  emptyMessage = 'No results.'
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })
  const router = useRouter()
  const currentPath = usePathname()

  return (
    <Table className="table-fixed">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow className="hover:bg-white" key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead
                  key={header.id}
                  className={cn(
                    'text-center text-sm md:text-base',
                    headerStyle[header.id]
                  )}
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
            const href = `${currentPath}/${row.original.id}` as Route
            const handleClick = linked
              ? () => {
                  router.push(href)
                }
              : (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                  e.currentTarget.classList.toggle('expanded')
                }
            return (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="cursor-pointer"
                onClick={handleClick}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="align-top">
                    <div className="text-center text-xs md:text-sm">
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
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
