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
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { SearchBar } from '../../_components/SearchBar'
import { ContestTitleFilter } from './ContestTitleFilter'

interface Item {
  status: string // Contest Main Page 에서 Row 배경색 동적 설정을 위한 status 추가
  id: number
}

interface ContestDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  search: string
  data: TData[]
  headerStyle: {
    [key: string]: string
  }
  linked?: boolean
  emptyMessage?: string
  itemsPerPage: number
  currentPage: number
  setFilteredData: (data: TData[]) => void
  resetPageIndex: () => void
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
 * @param itemsPerPage
 * itemsPerPage to handle pagination within the table
 * @param currentPage
 * currentPage to handle pagination within the table
 * @param setFilteredData
 * setFilteredData to update filtered data
 */

export function ContestDataTable<TData extends Item, TValue>({
  columns,
  data,
  search,
  headerStyle,
  linked = false,
  emptyMessage = 'No results.',
  itemsPerPage,
  currentPage,
  setFilteredData,
  resetPageIndex
}: ContestDataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })
  const router = useRouter()
  const currentPath = usePathname()
  const filteredRows = table.getFilteredRowModel().rows

  useEffect(() => {
    setFilteredData(filteredRows.map((row) => row.original))
  }, [filteredRows, setFilteredData])

  // Calculate paginated items based on currentPage and itemsPerPage
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedItems = table
    .getFilteredRowModel()
    .rows.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="flex flex-col gap-[41px]">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">전체 대회 리스트</h1>
        <div className="flex gap-4">
          <ContestTitleFilter
            column={table.getColumn('status')}
            title="State"
            options={status.map((item) => ({ value: item, label: item }))}
            resetPageIndex={resetPageIndex}
          />
          <SearchBar className="w-60" />
        </div>
      </div>
      <Table className="table-fixed">
        <TableHeader className="h-13 border-none">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              className="border-none bg-transparent hover:bg-transparent"
              key={headerGroup.id}
            >
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'bg-white text-center text-sm md:text-base',
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
          {paginatedItems?.length ? (
            paginatedItems.map((row) => {
              const href =
                `${currentPath}/${row.original.id}${search ? `?search=${search}` : ''}` as Route
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
                  className="cursor-pointer border-b-[1.5px] border-neutral-200 bg-white transition-colors hover:bg-neutral-50"
                  onClick={handleClick}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="align-middle">
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
    </div>
  )
}
