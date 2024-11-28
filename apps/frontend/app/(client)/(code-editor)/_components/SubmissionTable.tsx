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
  type ColumnDef,
  type Row
} from '@tanstack/react-table'
import type { Route } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Item {
  id: number
}

interface SubmissionTableProps<TData, TValue, TRoute extends string> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  getHref: (row: Row<TData>) => Route<TRoute>
}

const headerStyle: Record<string, string | undefined> = {
  id: 'w-[8%]',
  username: 'w-[15%]',
  result: 'w-[27%]',
  language: 'w-[14%]',
  createTime: 'w-[23%]',
  codeSize: 'w-[13%]'
}

export default function SubmissionTable<
  TData extends Item,
  TValue,
  TRoute extends string
>({ columns, data, getHref }: SubmissionTableProps<TData, TValue, TRoute>) {
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
            const href = getHref(row)
            return (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="cursor-pointer border-t border-slate-600 text-slate-300 hover:bg-slate-600/50 hover:font-semibold"
                onClick={() => {
                  router.replace(href)
                }}
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
                  >
                    <div className="text-center text-xs">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                    {/* for prefetch */}
                    <Link replace href={href} />
                  </TableCell>
                ))}
              </TableRow>
            )
          })
        ) : (
          <TableRow className="pointer-events-none">
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

interface SubmissionTableFallbackProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
}

export function SubmissionTableFallback<TData extends Item, TValue>({
  columns
}: SubmissionTableFallbackProps<TData, TValue>) {
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
                className="h-12"
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
