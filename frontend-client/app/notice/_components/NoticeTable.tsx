'use client'

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
  useReactTable
} from '@tanstack/react-table'
import dayjs from 'dayjs'
import Link from 'next/link'

interface Notice {
  id: number
  title: string
  createTime: string
  isFixed: boolean
  createdBy: string
}

interface NoticeTableProps {
  data: Notice[]
  currentPage: number
}

export default function NoticeTable({ data, currentPage }: NoticeTableProps) {
  const columns: ColumnDef<Notice>[] = [
    {
      header: 'Title',
      accessorKey: 'title',
      cell: ({ row }) => {
        return (
          <Link
            href={{
              pathname: `/notice/${row.original.id}`,
              query: { page: currentPage }
            }}
            className="text-sm md:text-base"
          >
            {row.original.title}
          </Link>
        )
      }
    },
    {
      header: () => (
        <div className="flex justify-end">
          <p className="flex w-24 justify-center md:w-32">Date</p>
        </div>
      ),
      accessorKey: 'createTime',
      cell: ({ row }) => {
        return (
          <div className="flex justify-end text-gray-500">
            <p className="text eli flex w-24 justify-center text-xs md:w-32 md:text-sm">
              {dayjs(row.original.createTime).format('YYYY-MM-DD')}
            </p>
          </div>
        )
      }
    }
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
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
  )
}
