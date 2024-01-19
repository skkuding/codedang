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
import type { Standings } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'

interface StandingsTableProps {
  data: Standings[]
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export default function StandingsTable({ data }: StandingsTableProps) {
  const columns: ColumnDef<Standings>[] = [
    {
      header: () => <p className="text-base font-medium text-gray-500">#</p>,
      accessorKey: 'ranking',
      cell: ({ row }) => {
        return <p className="text-xs md:text-sm">{row.original.ranking}</p>
      },
      id: 'ranking'
    },
    {
      header: () => (
        <p className="text-base font-medium text-gray-500">User ID</p>
      ),
      accessorKey: 'userId',
      cell: ({ row }) => {
        return <p className="text-xs md:text-sm">{row.original.userId}</p>
      },
      id: 'userId'
    },
    {
      header: () => (
        <p className="text-base font-medium text-gray-500">Problem</p>
      ),
      accessorKey: 'problem',
      columns: Array.from({ length: data[0].problemScore.length }).map(
        (_, i) => {
          return {
            header: () => (
              <div>
                <p className="text-xs md:text-sm">{alphabet[i]}</p>
                <p className="text-xs">(1500)</p>
              </div>
            ),
            accessorKey: i.toString(),
            cell: ({ row }) => {
              return (
                <div>
                  <p className="text-xs md:text-sm">
                    {row.original.problemScore[i].score}
                  </p>
                  <p className="text-xs md:text-sm">
                    {row.original.problemScore[i].time}
                  </p>
                </div>
              )
            }
          }
        }
      ),
      id: 'problem'
    },
    {
      header: () => (
        <p className="text-base font-medium text-gray-500">Total</p>
      ),
      accessorKey: 'total',
      columns: [
        {
          header: () => <p className="text-sm">Solved</p>,
          accessorKey: 'solved',
          cell: ({ row }) => {
            return <p className="text-xs md:text-sm">{row.original.solved}</p>
          },
          id: 'solved'
        },
        {
          header: () => <p className="text-sm">Score</p>,
          accessorKey: 'score',
          cell: ({ row }) => {
            return <p className="text-xs md:text-sm">{row.original.score}</p>
          },
          id: 'score'
        }
      ],
      id: 'total'
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
              const columnRelativeDepth = header.depth - header.column.depth

              if (
                !header.isPlaceholder &&
                columnRelativeDepth > 1 &&
                header.id === header.column.id
              ) {
                return null
              }

              let rowSpan = 1
              if (header.isPlaceholder) {
                const leafs = header.getLeafHeaders()
                rowSpan = leafs[leafs.length - 1].depth - header.depth
              }

              const className = cn(
                'border-b border-b-gray-200 text-center text-gray-600',
                header.column.columnDef.id !== 'ranking' &&
                  'border-l border-l-gray-200',
                ` w-[${
                  {
                    ranking: '4%',
                    userId: '15%'
                  }[header.column.columnDef.id as string]
                }]`,
                ` h-${
                  {
                    problem: '8',
                    total: '8'
                  }[header.column.columnDef.id as string]
                }`
              )

              return (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  rowSpan={rowSpan}
                  className={className}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className="border-b border-b-gray-200">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
              className="cursor-pointer"
              onClick={() => {}}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    'text-center text-gray-500',
                    cell.column.columnDef.id === 'ranking'
                      ? ''
                      : 'border-l border-l-gray-200'
                  )}
                  style={{ padding: 3 }}
                >
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
