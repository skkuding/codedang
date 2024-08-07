'use client'

import SearchBar from '@/components/SearchBar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import DataTableLangFilter from './DataTableLangFilter'
import DataTableLevelFilter from './DataTableLevelFilter'
import DataTableResultFilter from './DataTableResultFilter'

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
  enableFilter?: boolean
}

const variants = {
  todo: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none">
      <path
        stroke="gray"
        stroke-dasharray="4 4"
        stroke-opacity=".25"
        d="M1.5 9H1V5h.5V3c0-.82843.67157-1.5 1.5-1.5h2V1h4v.5h2c.8284 0 1.5.67157 1.5 1.5v2h.5v4h-.5v2c0 .8284-.6716 1.5-1.5 1.5H9v.5H5v-.5H3c-.82843 0-1.5-.6716-1.5-1.5V9Z"
      />
    </svg>
  ),
  accept: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none">
      <path
        fill="#619CFB"
        fill-rule="evenodd"
        d="M7 13c3.3137 0 6-2.6863 6-6 0-3.31371-2.6863-6-6-6-3.31371 0-6 2.68629-6 6 0 3.3137 2.68629 6 6 6Zm3.4286-7.6965c.1953-.19526.1953-.51184 0-.7071-.1952-.19526-.51182-.19526-.70708 0L5.97498 8.34294l-1.6965-1.69649c-.19526-.19527-.51184-.19527-.70711 0-.19526.19526-.19526.51184 0 .7071L5.62142 9.4036l.35356.35356.35355-.35356 4.10007-4.1001Z"
        clip-rule="evenodd"
      />
    </svg>
  ),
  attempt: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none">
      <path
        fill="#FF3B2F"
        d="M14 8c0 3.3137-2.6863 6-6 6-3.31371 0-6-2.6863-6-6 0-3.31371 2.68629-6 6-6 3.3137 0 6 2.68629 6 6Z"
      />
      <g stroke="#fff" stroke-linecap="round">
        <path d="m5.75 10.25 4.5-4.5M5.75 10.25l4.5-4.5M5.75 10.25l4.5-4.5M5.75 10.25l4.5-4.5M5.75 10.25l4.5-4.5M10.25 10.25l-4.5-4.5M10.25 10.25l-4.5-4.5M10.25 10.25l-4.5-4.5M10.25 10.25l-4.5-4.5M10.25 10.25l-4.5-4.5" />
      </g>
    </svg>
  )
}

const levels = ['Level1', 'Level2', 'Level3', 'Level4', 'Level5']
const languageOptions = ['C', 'Cpp', 'Java', 'Python3']
const resultOptions = [
  {
    label: 'To-do',
    value: 'toDo',
    icon: variants.todo
  },
  {
    label: 'Solved',
    value: 'solved',
    icon: variants.accept
  },
  {
    label: 'Attempted',
    value: 'attempted',
    icon: variants.attempt
  }
]
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
  enableFilter = false,
  emptyMessage = 'No results.'
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  })
  const router = useRouter()
  const currentPath = usePathname()

  return (
    <>
      <>
        {enableFilter && (
          <div className="flex items-center justify-between gap-96">
            <div className="flex" style={{ marginRight: '96px' }}>
              <SearchBar />
            </div>

            <div className="flex gap-5">
              {table.getColumn('difficulty') && (
                <DataTableLevelFilter
                  column={table.getColumn('difficulty')}
                  title="Level"
                  options={levels}
                />
              )}
              {table.getColumn('languages') && (
                <DataTableLangFilter
                  column={table.getColumn('languages')}
                  title="Languages"
                  options={languageOptions}
                />
              )}
              {table.getColumn('results') && (
                <DataTableResultFilter
                  column={table.getColumn('results')}
                  title="Result"
                  options={resultOptions}
                />
              )}
            </div>
          </div>
        )}
      </>
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
    </>
  )
}
