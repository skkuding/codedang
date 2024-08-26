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
import icon1_result from '@/public/icon1_result.svg'
import icon2_result from '@/public/icon2_result.svg'
import icon3_result from '@/public/icon3_result.svg'
import type { ColumnDef } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { Route } from 'next'
import Image from 'next/image'
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
  todo: <Image src={icon1_result} alt="Todo Icon" />,
  accept: <Image src={icon2_result} alt="Accept Icon" />,
  attempt: <Image src={icon3_result} alt="Attempt Icon" />
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
          <div className="flex w-full items-center justify-between">
            <div className="flex gap-1">
              <SearchBar />
            </div>
            <div>
              <div className="ml-2 flex items-center gap-2">
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
          </div>
        )}
      </>

      <Table className="my-4 table-fixed">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              className="bg-gray-200 text-gray-400"
              key={headerGroup.id}
            >
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'py-2 text-center text-gray-400 md:text-base',
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
                  className={cn('cursor-pointer hover:bg-gray-50')}
                  onClick={handleClick}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="p-2 text-center align-middle text-xs md:text-sm"
                    >
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
