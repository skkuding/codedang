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
import type { ColumnDef } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'

interface Problem {
  id: number
  title: string
  difficulty: string
  submissionCount: number
  acceptedRate: number
  tags?: string[]
  info?: string
  createTime?: string
}

interface ProblemProps {
  data: Problem[]
  currentPage: number
}

const LevelColors = {
  Level1: 'bg-sky-300',
  Level2: 'bg-green-300',
  Level3: 'bg-amber-200',
  Level4: 'bg-orange-400',
  Level5: 'bg-rose-500'
}

export default function Problem({ data, currentPage }: ProblemProps) {
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
          <span className="text-sm md:text-base">{row.original.title}</span>
        )
      }
    },
    {
      header: 'Level',
      accessorKey: 'difficulty',
      cell: ({ row }) => {
        return (
          <span className="flex items-center justify-between text-sm  md:text-base">
            <div
              className={cn(
                'h-3 w-3 rounded-full',
                LevelColors[row.original.difficulty as keyof typeof LevelColors]
              )}
            ></div>
            {row.original.difficulty.slice(0, 5) +
              ' ' +
              row.original.difficulty.slice(5)}
          </span>
        )
      }
    },
    {
      header: 'Submission',
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
      header: 'Solved Rate',
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
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <div className="rounded-md border">
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
                  console.log(row.original.id)
                  console.log(currentPage)
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
    </div>
  )
}
