'use client'

import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import type { ColumnDef } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'
import dayjs from 'dayjs'

interface Notice {
  id: number
  title: string
  createTime: string
  isFixed: boolean
  createdBy: string
}

const columns: ColumnDef<Notice>[] = [
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => {
      return <div className="text-base">{row.original.title}</div>
    }
  },
  {
    header: () => (
      <div className="flex justify-end">
        <div className="flex w-32 justify-center">Date</div>
      </div>
    ),
    accessorKey: 'createTime',
    cell: ({ row }) => {
      return (
        <div className="flex justify-end text-gray-500">
          <div className="flex w-32 justify-center">
            {dayjs(row.original.createTime).format('YYYY-MM-DD')}
          </div>
        </div>
      )
    }
  }
]

interface NoticeTableProps {
  data: Notice[]
  page: number
}

export default function NoticeTable({ data, page }: NoticeTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <div className="mt-5">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
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
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Pagination>
        <PaginationContent>
          <PaginationPrevious
            href={page === 1 ? undefined : `?page=${page - 1}`}
            className={page === 1 ? 'cursor-not-allowed opacity-30' : undefined}
          />
          <PaginationLink href="?page=1" isActive={page === 1}>
            1
          </PaginationLink>
          <PaginationLink href="?page=2" isActive={page === 2}>
            2
          </PaginationLink>
          <PaginationLink href="?page=3" isActive={page === 3}>
            3
          </PaginationLink>
          <PaginationLink href="?page=4" isActive={page === 4}>
            4
          </PaginationLink>
          <PaginationLink href="?page=5" isActive={page === 5}>
            5
          </PaginationLink>
          <PaginationNext href={`?page=${page + 1}`} />
        </PaginationContent>
      </Pagination>
    </div>
  )
}
