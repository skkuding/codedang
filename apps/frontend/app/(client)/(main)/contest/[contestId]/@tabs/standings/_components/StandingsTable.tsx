'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
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
  theme: string
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const myUserId = 2020312938

// TODO: theme 넘겨주는 방식이 바뀔 수도 있습니다.
export default function StandingsTable({ data, theme }: StandingsTableProps) {
  const darkTextColor = 'text-slate-300'
  const lightTextColor = 'text-gray-500'
  const darkBorderColor = 'border-slate-500'
  const lightBorderColor = 'border-gray-200'

  const textColor = theme === 'dark' ? darkTextColor : lightTextColor
  const borderColor = theme === 'dark' ? darkBorderColor : lightBorderColor

  const myRecordStyle =
    theme === 'dark'
      ? 'bg-slate-800 font-extrabold text-primary'
      : 'bg-gray-300 font-extrabold text-gray-800'

  const columns: ColumnDef<Standings>[] = [
    {
      header: () => (
        <p className={cn('text-base font-medium md:text-lg', textColor)}>#</p>
      ),
      accessorKey: 'ranking',
      cell: ({ row }) => {
        return <p className="text-xs md:text-sm">{row.original.ranking}</p>
      },
      id: 'ranking'
    },
    {
      header: () => (
        <p className={cn('text-xs font-medium md:text-base', textColor)}>
          User ID
        </p>
      ),
      accessorKey: 'userId',
      cell: ({ row }) => {
        return <p className="text-xs md:text-sm">{row.original.userId}</p>
      },
      id: 'userId'
    },
    {
      header: () => (
        <p className={cn('text-sm font-medium md:text-base', textColor)}>
          Problem
        </p>
      ),
      accessorKey: 'problem',
      columns: Array.from({ length: data[0].problemScore.length }).map(
        (_, i) => {
          return {
            // TODO: Contest Problem API 연결하기
            header: () => (
              <div>
                <p className="text-xs md:text-sm">{alphabet[i]}</p>
                <p className="text-xs md:text-sm">(1500)</p>
              </div>
            ),
            accessorKey: i.toString(),
            cell: ({ row }) => {
              return (
                <>
                  <p className="text-xs md:text-sm">
                    {row.original.problemScore[i].score}
                  </p>
                  <p className="text-xs md:text-sm">
                    {row.original.problemScore[i].time}
                  </p>
                </>
              )
            }
          }
        }
      ),
      id: 'problem'
    },
    {
      header: () => (
        <p className={cn('text-sm font-medium md:text-base', textColor)}>
          Total
        </p>
      ),
      accessorKey: 'total',
      columns: [
        {
          header: () => <p className="text-xs md:text-sm">Solved</p>,
          accessorKey: 'solved',
          cell: ({ row }) => {
            return <p className="text-xs md:text-sm">{row.original.solved}</p>
          },
          id: 'solved'
        },
        {
          header: () => <p className="text-xs md:text-sm">Score</p>,
          accessorKey: 'score',
          cell: ({ row }) => {
            return (
              <p className="text-xs md:text-sm">{row.original.totalScore}</p>
            )
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
    <Table className={cn('table-fixed', theme === 'dark' && 'bg-slate-600')}>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow
            key={headerGroup.id}
            className={cn(theme === 'dark' && 'hover:bg-gray-700/50')}
          >
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
                'border-b text-center',
                textColor,
                borderColor,
                header.column.columnDef.id !== 'ranking' && 'border-l',
                ` w-${
                  {
                    ranking: '10',
                    userId: '[15%]',
                    total: '[15%]'
                  }[header.column.columnDef.id as string]
                }`,
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
                  style={{ padding: 0 }}
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
      <TableBody className={cn('border-b text-center', borderColor)}>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
              className={cn(
                'cursor-pointer',
                theme === 'dark' && 'hover:bg-gray-700/50'
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    'border-b text-center',
                    textColor,
                    borderColor,
                    cell.column.columnDef.id !== 'ranking' && 'border-l',
                    row.original.userId === myUserId && myRecordStyle
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
