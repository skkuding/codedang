'use client'

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
  useReactTable
} from '@tanstack/react-table'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface Item {
  id: number | string
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  headerStyle: {
    [key: string]: string
  }
  tableClassName?: string
  headerClassName?: string
  bodyClassName?: string
  headerRowClassName?: string
  headerCellClassName?: string
  cellClassName?: string
  tableRowStyle?: string
  linked?: boolean
  emptyMessage?: string
  emptyCellClassName?: string
  pathSegment?: string | null
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

export function DataTable<TData extends Item, TValue>({
  columns,
  data,
  headerStyle,
  tableClassName,
  headerClassName,
  bodyClassName,
  headerRowClassName,
  headerCellClassName,
  cellClassName,
  tableRowStyle,
  linked = false,
  emptyMessage = 'No results.',
  emptyCellClassName,
  pathSegment
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })
  const currentPath = usePathname()
  const router = useRouter()

  return (
    <Table
      className={cn(
        'table-fixed border-b-[1.5px] border-[#80808040]',
        tableClassName
      )}
    >
      <TableHeader className={headerClassName}>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow
            className={cn('hover:bg-white', headerRowClassName)}
            key={headerGroup.id}
          >
            {headerGroup.headers.map((header) => {
              return (
                <TableHead
                  key={header.id}
                  className={cn(
                    'whitespace-nowrap border-b-[1.5px] border-[#80808040] text-center text-sm font-normal md:text-base',
                    headerCellClassName,
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
      <TableBody className={bodyClassName}>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const href = pathSegment
              ? `${currentPath}/${pathSegment}/${row.original.id}`
              : `${currentPath}/${row.original.id}`

            return (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className={cn(
                  'cursor-pointer border-b-[1.5px] border-[#80808040] hover:bg-[#80808014]',
                  tableRowStyle
                )}
                onClick={
                  linked
                    ? () => router.push(href as Route)
                    : (e) => e.currentTarget.classList.toggle('expanded')
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn('align-top', cellClassName)}
                  >
                    {linked ? (
                      <Link
                        href={href as Route}
                        className="block h-full w-full"
                      >
                        <div className="text-center text-xs md:text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      </Link>
                    ) : (
                      <div className="text-center text-xs md:text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            )
          })
        ) : (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className={cn('h-24 text-center', emptyCellClassName)}
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
