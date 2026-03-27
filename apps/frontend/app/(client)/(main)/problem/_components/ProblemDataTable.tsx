'use client'

import { SearchBar } from '@/app/(client)/(main)/_components/SearchBar'
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
  id: number
}

interface ProblemDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  total: number
  itemsPerPage: number
  currentPage: number
  headerStyle: {
    [key: string]: string
  }
  search: string
  linked?: boolean
  emptyMessage?: string
}

export function ProblemDataTable<TData extends Item, TValue>({
  columns,
  data,
  total,
  itemsPerPage,
  currentPage,
  headerStyle,
  search,
  linked = false,
  emptyMessage = 'No results.'
}: ProblemDataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })
  const router = useRouter()
  const currentPath = usePathname()

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedItems = table
    .getRowModel()
    .rows.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center justify-start gap-2">
          <p className="text-head3_sb_28">등록된 문제</p>
          <p className="text-head3_sb_28 text-primary">{total}</p>
        </div>
        <div className="flex items-center justify-start gap-2">
          <SearchBar className="w-60" />
        </div>
      </div>
      <div className="bg-background border-line mb-10 mt-5 w-full overflow-hidden rounded-[20px] border">
        <Table className="table-fixed border-separate border-spacing-0">
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b hover:bg-transparent"
              >
                {headerGroup.headers.map((header, index) => {
                  const isFirst = index === 0
                  const isLast = index === headerGroup.headers.length - 1

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'border-line h-13 border-b px-5 py-2 text-center',
                        isFirst && 'rounded-tl-[20px]',
                        isLast && 'rounded-tr-[20px]',
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
          <TableBody className="[&_tr:last-child]:border-b-0">
            {paginatedItems.length ? (
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
                    className="border-line h-16 cursor-pointer border-b hover:bg-transparent"
                    onClick={handleClick}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="border-line h-16 px-5 py-0 align-middle"
                      >
                        {linked ? (
                          <Link
                            href={href}
                            className={cn(
                              'flex h-full w-full items-center',
                              cell.column.id === 'title'
                                ? 'justify-start'
                                : 'justify-center'
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </Link>
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
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
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
