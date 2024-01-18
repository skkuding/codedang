'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { Problem } from '@/types/type'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel
} from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import SortableHeader from './SortableHeader'

interface ProblemProps {
  data: Problem[]
  isLoading: boolean
  isTagChecked: boolean
}

interface TagProps {
  id: number
  name: string
}
const variants = {
  Level1: 'bg-sky-300',
  Level2: 'bg-green-300',
  Level3: 'bg-amber-200',
  Level4: 'bg-orange-400',
  Level5: 'bg-rose-500'
}

export default function ProblemTable({
  data,
  isLoading,
  isTagChecked
}: ProblemProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<Problem>[] = [
    {
      header: '#',
      accessorKey: 'id',
      cell: ({ row }) => {
        return <span className="text-sm md:text-base">{row.original.id}</span>
      }
    },

    {
      header: 'Title',
      accessorKey: 'title',
      cell: ({ row }) => {
        return (
          <div className="flex flex-col gap-2 text-left">
            <span className="text-sm md:text-base">{row.original.title}</span>
            {isTagChecked &&
              row.original.tags &&
              row.original.tags.length > 0 && (
                <div className="flex flex-row">
                  {row.original.tags.map((tag: TagProps) => (
                    <Badge
                      key={tag.id}
                      className="text-sm hover:bg-gray-300 md:text-base"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
          </div>
        )
      }
    },
    {
      header: ({ column }) => (
        <SortableHeader column={column} title="Level" name="level" />
      ),
      accessorKey: 'difficulty',
      cell: ({ row }) => {
        return (
          <span className="flex items-center justify-center gap-1 text-center text-sm  md:gap-3 md:text-base">
            <div
              className={cn(
                'h-3 w-3 rounded-full',
                variants[row.original.difficulty]
              )}
            ></div>
            <div className="hidden md:block">
              {'Level ' + row.original.difficulty.slice(5)}
            </div>
            <div className="md:hidden">
              {'Lv ' + row.original.difficulty.slice(5)}
            </div>
          </span>
        )
      }
    },
    {
      header: ({ column }) => (
        <SortableHeader column={column} title="Submission" name="submit" />
      ),
      accessorKey: 'submissionCount',
      cell: ({ row }) => {
        return (
          <span className="text-sm md:text-base">
            {row.original.submissionCount}
          </span>
        )
      }
    },
    {
      header: ({ column }) => (
        <SortableHeader column={column} title="Solved Rate" name="acrate" />
      ),
      accessorKey: 'acceptedRate',
      cell: ({ row }) => {
        return (
          <span className="text-sm md:text-base">
            {row.original.acceptedRate + '%'}
          </span>
        )
      }
    },
    {
      header: 'Info',
      accessorKey: 'info',
      cell: ({ row }) => {
        return <span className="text-sm md:text-base">{row.original.info}</span>
      }
    }
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting
    }
  })

  return (
    <div className="rounded-md">
      <Table className="table-fixed">
        <TableHeader className="border-b-2 border-gray-700 text-gray-500">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    className={cn(
                      'font-bold',
                      header.column.columnDef.header === 'Title'
                        ? 'w-[30%] text-sm md:w-[35%] md:text-base'
                        : 'w-[20%] text-center text-sm md:w-[25%] md:text-base'
                    )}
                    key={header.id}
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
                  className="cursor-pointer text-center text-gray-700 hover:font-bold "
                  onClick={() => {
                    console.log(row.original.id)
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="px-1 py-4" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
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
    </div>
  )
}
