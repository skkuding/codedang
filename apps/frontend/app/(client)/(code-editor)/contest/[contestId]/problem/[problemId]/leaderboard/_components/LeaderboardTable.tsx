'use client'

import { Skeleton } from '@/components/shadcn/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { cn } from '@/libs/utils'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef
} from '@tanstack/react-table'
import { useTranslate } from '@tolgee/react'

interface Item {
  id: number
}

interface LeaderboardTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

const headerStyle: Record<string, string | undefined> = {
  rank: 'w-[20%]',
  userID: 'w-[29%]',
  penalty: 'w-[30%]',
  solved: 'w-[22%]'
}

export function LeaderboardTable<TData extends Item, TValue>({
  columns,
  data
}: LeaderboardTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })
  const { t } = useTranslate()

  return (
    <Table className="table-fixed">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow className="pointer-events-none" key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className={cn(
                  'border-b border-slate-600 p-0 text-center text-xs font-semibold text-white',
                  headerStyle[header.id]
                )}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            return (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="cursor-pointer border-t border-slate-600 text-slate-300 hover:bg-slate-600/50 hover:font-semibold"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{
                      paddingTop: 10,
                      paddingBottom: 10,
                      paddingLeft: 2,
                      paddingRight: 2
                    }}
                    className="border-b-2 border-slate-700"
                  >
                    <div className="text-center text-xs">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            )
          })
        ) : (
          <TableRow className="pointer-events-none">
            <TableCell colSpan={columns.length} className="h-24 text-center">
              {t('no_results')}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

interface LeaderboardTableFallbackProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
}

export function LeaderboardTableFallback<TData extends Item, TValue>({
  columns
}: LeaderboardTableFallbackProps<TData, TValue>) {
  const table = useReactTable({
    data: [],
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <Table className="w-full table-fixed">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow className="pointer-events-none" key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className={cn(
                  'border-b border-slate-600 p-0 text-center text-xs font-semibold text-white',
                  headerStyle[header.id]
                )}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className="w-full">
        {Array(20)
          .fill('')
          .map((_, i) => (
            <TableRow
              className="pointer-events-none border-t border-slate-600"
              key={i}
            >
              <TableCell
                colSpan={Number(table.getAllColumns().length)}
                className="h-12 border-b-2 border-slate-700"
                style={{
                  paddingTop: 10,
                  paddingBottom: 10,
                  paddingLeft: 2,
                  paddingRight: 2
                }}
              >
                <Skeleton className="size-full bg-slate-900" />
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  )
}
