'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
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
      header: () => <p className="text-center text-sm">#</p>,
      accessorKey: 'ranking',
      cell: ({ row }) => {
        return <p className="text-xs md:text-sm">{row.original.ranking}</p>
      }
    },
    {
      header: () => <p className="text-center text-sm">User ID</p>,
      accessorKey: 'userId',
      cell: ({ row }) => {
        return <p className="text-xs md:text-sm">{row.original.userId}</p>
      }
    },
    {
      header: () => <p className="text-center text-sm">Problem</p>,
      accessorKey: 'problem',
      columns: Array.from({ length: data[0].problemScore.length }).map(
        (_, i) => {
          return {
            header: () => (
              <div className="text-center">
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
      )
    },
    {
      header: () => <p className="text-center text-sm">Total</p>,
      accessorKey: 'total',
      columns: [
        {
          header: () => <p className="text-center text-sm">Solved</p>,
          accessorKey: 'solved',
          cell: ({ row }) => {
            return <p className="text-xs md:text-sm">{row.original.solved}</p>
          }
        },
        {
          header: () => <p className="text-center text-sm">Score</p>,
          accessorKey: 'score',
          cell: ({ row }) => {
            return <p className="text-xs md:text-sm">{row.original.score}</p>
          }
        }
      ]
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
                  colSpan={header.colSpan}
                  className="border-x border-gray-200"
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
                <TableCell
                  key={cell.id}
                  className="border-x border-gray-200 text-center"
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
