'use client'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { Contest } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import dayjs from 'dayjs'
import { useState } from 'react'

interface ContestTableProps {
  data: Contest[]
}

export default function ContestTable({ data }: ContestTableProps) {
  const [filter, setFilter] = useState('all')
  const [filteredData, setFilteredData] = useState<Contest[]>(data)

  const filterContests = (filterType: string) => {
    setFilter(filterType)
    if (filterType === 'all') {
      setFilteredData(data)
    } else if (filterType === 'upcoming') {
      const upcomingContests = data.filter(
        (contest) => contest.status === 'upcoming'
      )
      setFilteredData(upcomingContests)
    } else if (filterType === 'finished') {
      const finishedContests = data.filter(
        (contest) => contest.status === 'finished'
      )
      setFilteredData(finishedContests)
    }
  }

  const columns: ColumnDef<Contest>[] = [
    {
      header: 'Name',
      accessorKey: 'title',
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-start gap-3 md:gap-4">
            <span className="text-sm md:text-base">{row.original.title}</span>
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
      accessorKey: 'participants',
      cell: ({ row }) => {
        return (
          <p className="text-center">
            {/* TODO participant로 변경 */}
            <span className="text-xs md:text-sm">{row.original.id}</span>
          </p>
        )
      }
    }
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <>
      <div className="mt-4 flex items-center">
        <Button
          variant={'link'}
          className={cn(
            'text-xl font-semibold text-gray-500',
            filter === 'all' && 'text-primary'
          )}
          onClick={() => filterContests('all')}
        >
          All
        </Button>
        <Button
          variant={'link'}
          className={cn(
            'text-xl font-semibold text-gray-500',
            filter === 'upcoming' && 'text-primary'
          )}
          onClick={() => filterContests('upcoming')}
        >
          Upcoming
        </Button>
        <Button
          variant={'link'}
          className={cn(
            'text-xl font-semibold text-gray-500',
            filter === 'finished' && 'text-primary'
          )}
          onClick={() => filterContests('finished')}
        >
          Finished
        </Button>
      </div>
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
    </>
  )
}
