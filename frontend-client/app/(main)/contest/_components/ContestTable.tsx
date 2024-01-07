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
import { Contest } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import dayjs from 'dayjs'

interface ContestTableProps {
  data: Contest[]
}

export default function ContestTable({ data }: ContestTableProps) {
  const columns: ColumnDef<Contest>[] = [
    {
      header: 'Name',
      accessorKey: 'title',
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-start gap-3 md:gap-4">
            <span
              className={cn(
                row.original.title && 'font-semibold',
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
          <span>Starts at</span>
        </p>
      ),
      accessorKey: 'startTime',
      cell: ({ row }) => {
        return (
          <p className="text-center">
            <span className="text-xs md:text-sm">
              {dayjs(row.original.startTime).format('YYYY-MM-DD')}
            </span>
          </p>
        )
      }
    },
    {
      header: () => (
        <p className="text-center">
          <span>Ends at</span>
        </p>
      ),
      accessorKey: 'endTime',
      cell: ({ row }) => {
        return (
          <p className="text-center">
            <span className="text-xs md:text-sm">
              {dayjs(row.original.endTime).format('YYYY-MM-DD')}
            </span>
          </p>
        )
      }
    },
    {
      header: () => (
        <p className="text-center">
          <span>Participants</span>
        </p>
      ),
      accessorKey: 'startTime',
      cell: () => {
        return (
          <p className="text-center">
            <span className="text-xs md:text-sm">1</span>
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
                    header.column.columnDef.header === 'Name'
                      ? 'w-[55%] md:w-[61%]'
                      : 'w-[15%] md:w-[13%]'
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
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
              className="cursor-pointer"
              onClick={() => {}}
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
