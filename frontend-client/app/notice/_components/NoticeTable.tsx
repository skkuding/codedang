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
import { useRouter } from 'next/navigation'
import { PiPushPinFill } from 'react-icons/pi'

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
          <div className="flex items-center justify-start gap-3 md:gap-4">
            {row.original.isFixed && (
              <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full p-1 text-white md:h-6 md:w-6">
                <PiPushPinFill />
              </div>
            )}
            <span className="text-sm md:text-base">{row.original.title}</span>
          </div>
        )
      }
    },
    {
      header: () => (
        <div className="flex justify-end">
          <span className="flex w-24 justify-center md:w-32">Date</span>
        </div>
      ),
      accessorKey: 'createTime',
      cell: ({ row }) => {
        return (
          <div className="flex justify-end text-gray-500">
            <span className="text eli flex w-24 justify-center text-xs md:w-32 md:text-sm">
              {dayjs(row.original.createTime).format('YYYY-MM-DD')}
            </span>
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

  const router = useRouter()

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
              className="cursor-pointer"
              onClick={() => {
                router.push(`/notice/${row.original.id}?page=${currentPage}`)
              }}
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
