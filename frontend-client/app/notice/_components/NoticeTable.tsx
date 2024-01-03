'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { Notice } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import dayjs from 'dayjs'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PiPushPinFill } from 'react-icons/pi'

interface NoticeTableProps {
  data: Notice[]
  isLoading: boolean
}

export default function NoticeTable({ data, isLoading }: NoticeTableProps) {
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
            <span
              className={cn(
                row.original.isFixed && 'font-semibold',
                'text-sm md:text-base'
              )}
            >
              {row.original.title}
            </span>
          </div>
        )
      }
    },
    {
      header: () => (
        <p className="text-center">
          <span>Writer</span>
        </p>
      ),
      accessorKey: 'createdBy',
      cell: ({ row }) => {
        return (
          <p className="text-center">
            <span className="text-xs md:text-sm">{row.original.createdBy}</span>
          </p>
        )
      }
    },
    {
      header: () => (
        <p className="text-center">
          <span>Date</span>
        </p>
      ),
      accessorKey: 'createTime',
      cell: ({ row }) => {
        return (
          <p className="text-center">
            <span className="text-xs md:text-sm">
              {dayjs(row.original.createTime).format('YYYY-MM-DD')}
            </span>
          </p>
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
    <Table className="table-fixed">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead
                  key={header.id}
                  className={
                    header.column.columnDef.header === 'Title'
                      ? 'w-[60%] md:w-[64%]'
                      : 'w-[20%] md:w-[18%]'
                  }
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
        {!isLoading ? (
          table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="cursor-pointer"
                onClick={() => {
                  router.push(`/notice/${row.original.id}`)
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
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-gray-500"
              >
                No results.
              </TableCell>
            </TableRow>
          )
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24">
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Loader2 className="w-5 animate-spin" />
                Loading...
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
