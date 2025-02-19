'use client'

import type { Problem } from '@/app/(client)/(main)/course/[courseId]/grade/@tabs/assignment/_components/AssignmentTableColumns'
import { ScoreSlider } from '@/app/(client)/(main)/course/[courseId]/grade/@tabs/assignment/_components/ScoreSlider'
import { useDataTable } from '@/app/admin/_components/table/context'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Table
} from '@/components/shadcn/table'
import {
  flexRender,
  type Row,
  type Table as TanstackTable
} from '@tanstack/react-table'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FaPollH } from 'react-icons/fa'
import { Button } from '../shadcn/button'

interface DataTableProps<
  TData extends { id: number; problems: Problem[] },
  TRoute extends string
> {
  headerStyle?: Record<string, string>
  showFooter?: boolean
  getHref?: (data: TData) => Route<TRoute>
  onRowClick?: (table: TanstackTable<TData>, row: Row<TData>) => void
}

export function DataTableWithToggle<
  TData extends { id: number; problems: Problem[] },
  TRoute extends string
>({
  headerStyle = {},
  showFooter = false,
  getHref,
  onRowClick
}: DataTableProps<TData, TRoute>) {
  const router = useRouter()
  const { table } = useDataTable<TData>()
  const [expandedRows, setExpandedRows] = useState<number[]>([])

  // 토글 기능
  const toggleRow = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    )
  }

  return (
    <ScrollArea className="max-w-full rounded border">
      <Table>
        <TableHeader className="[&_tr]:border-b-gray-200">
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
              <TableHead />
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <>
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center md:p-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRow(row.original.id)}
                    >
                      <FaPollH />
                      {expandedRows.includes(row.original.id) ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronLeft size={16} />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>

                {expandedRows.includes(row.original.id) &&
                  row.original.problems.map((problem) => (
                    <TableRow key={`problem-${problem.id}`}>
                      <TableCell className="pl-6 font-semibold text-gray-400">
                        {problem.title}
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        <ScoreSlider />
                      </TableCell>
                      <TableCell className="text-center">
                        {problem.mean}
                      </TableCell>
                      <TableCell className="text-center">
                        {problem.max}
                      </TableCell>
                      <TableCell className="text-center">
                        {problem.min}
                      </TableCell>

                      <TableCell className="text-center">
                        {problem.isSubmitted ? '✅' : '❌'}
                      </TableCell>
                    </TableRow>
                  ))}
              </>
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

        {/* 푸터 표시 여부 */}
        {showFooter && (
          <TableFooter>
            {table.getFooterGroups().map((footerGroup) => (
              <TableRow key={footerGroup.id}>
                <TableHead className="w-12" /> {/* 토글 버튼 공간 */}
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
