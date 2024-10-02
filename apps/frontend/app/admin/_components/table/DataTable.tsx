'use client'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Table
} from '@/components/ui/table'
import {
  flexRender,
  type Row,
  type Table as TanstackTable
} from '@tanstack/react-table'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useDataTable } from './context'

interface DataTableProps<TData extends { id: number }, TRoute extends string> {
  headerStyle?: Record<string, string>
  enableFooter?: boolean
  getHref?: (data: TData) => Route<TRoute>
  onRowClick?: (table: TanstackTable<TData>, row: Row<TData>) => void
}

export default function DataTable<
  TData extends { id: number },
  TRoute extends string
>({
  headerStyle = {},
  enableFooter = false,
  getHref,
  onRowClick
}: DataTableProps<TData, TRoute>) {
  const router = useRouter()
  const { table } = useDataTable<TData>()

  return (
    <ScrollArea className="max-w-full rounded border">
      <Table>
        <TableHeader className="bg-neutral-100 [&_tr]:border-b-gray-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className={headerStyle[header.id]}>
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
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="cursor-pointer hover:bg-neutral-200/30"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="text-center md:p-4"
                    onClick={() => {
                      onRowClick?.(table, row)

                      const href = getHref?.(row.original)

                      if (href) {
                        router.push(href)
                      }
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={Number(table.getAllColumns().length)}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {enableFooter && (
          <TableFooter>
            {table.getFooterGroups().map((footerGroup) => (
              <TableRow key={footerGroup.id}>
                {footerGroup.headers.map((footer) => (
                  <TableHead key={footer.id} className={headerStyle[footer.id]}>
                    {footer.isPlaceholder
                      ? null
                      : flexRender(
                          footer.column.columnDef.footer,
                          footer.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableFooter>
        )}
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
