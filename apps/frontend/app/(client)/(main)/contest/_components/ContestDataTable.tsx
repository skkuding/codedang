'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { status } from '@/libs/constants'
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
import { usePathname, useRouter } from 'next/navigation'
import { SearchBar } from '../../_components/SearchBar'
import { ContestTitleFilter } from './ContestTitleFilter'

interface Item {
  status: string // Contest Main Page 에서 Row 배경색 동적 설정을 위한 status 추가
  id: number
}

interface ContestDataTableProps<TData, TValue> {
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

export function ContestDataTable<TData extends Item, TValue>({
  columns,
  data,
  headerStyle,
  linked = false,
  emptyMessage = 'No results.'
}: ContestDataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel()
    // getPaginationRowModel: getPaginationRowModel(),
    // getSortedRowModel: getSortedRowModel()
    // getFacetedRowModel: getFacetedRowModel(),
    // getFacetedUniqueValues: getFacetedUniqueValues()
  })
  const router = useRouter()
  const currentPath = usePathname()

  return (
    <>
      {/* filter 구현 위해 ContestTitleFilter에 table column props 전달해야하는데 이를 위해 useContext..? 애매
          (유저페이지에서 Filter 기능 이용하는 경우 Contest 밖에 없는 것으로 파악)
      */}
      <div className="mb-11 flex justify-between">
        <h1 className="text-2xl font-semibold text-gray-700">CONTEST LIST</h1>
        <div className="flex gap-4">
          <SearchBar className="w-60" />
          <ContestTitleFilter
            table={table}
            column={table.getColumn('status')}
            title="Status"
            options={status.map((item) => ({ value: item, label: item }))}
          />
        </div>
      </div>
      <Table className="table-fixed">
        <TableHeader className="border-b-[1.5px] border-neutral-200">
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
                  className={`cursor-pointer border-b-[1.5px] border-neutral-200 ${(() => {
                    let rowClass = ''
                    switch (true) {
                      case row.original.status
                        .toLowerCase()
                        .includes('upcoming'):
                        rowClass = 'bg-neutral-100'
                        break
                      case row.original.status
                        .toLowerCase()
                        .includes('ongoing'):
                        rowClass = 'bg-neutral-50'
                        break
                      default:
                        rowClass = ''
                    }
                    return rowClass
                  })()}`} // Row 배경색 동적 설정
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
