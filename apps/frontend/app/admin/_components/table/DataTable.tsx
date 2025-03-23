'use client'

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
import { cn } from '@/libs/utils'
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
  showFooter?: boolean
  isModalDataTable?: boolean
  /**
   * 각 행의 데이터에 따라 href를 반환하는 함수
   * @param data
   * row data
   * @returns href for routing
   */
  getHref?: (data: TData) => Route<TRoute>
  /**
   * 행 클릭 시 호출되는 함수
   * @param table
   * table instance
   * @param row
   * row instance
   */
  onRowClick?: (table: TanstackTable<TData>, row: Row<TData>) => void
}

/**
 * 어드민 테이블 컴포넌트
 * @param headerStyle
 * header별 tailwind classname을 정의한 객체
 * @param showFooter
 * footer 표시 여부 (기본값: false)
 * @param isModalDataTable
 * DataTable이 모달(Dialog) 내부에 위치할 경우 true로 설정(모달 내의 DataTable의 header 디자인이 다름) (기본값: false)
 * @param getHref
 * 각 행의 데이터에 따라 href를 반환하는 함수
 * @param onRowClick
 * 행 클릭 시 호출되는 함수
 */
export function DataTable<TData extends { id: number }, TRoute extends string>({
  headerStyle = {},
  showFooter = false,
  isModalDataTable = false,
  getHref,
  onRowClick
}: DataTableProps<TData, TRoute>) {
  const router = useRouter()
  const { table } = useDataTable<TData>()

  return (
    <ScrollArea className="max-w-full rounded">
      <Table>
        <TableHeader
          className={cn(
            '[&_td]:border-[#80808040]',
            isModalDataTable && 'h-10 border-b-0'
          )}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className={cn(isModalDataTable && 'bg-neutral-200/30')}
            >
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

        <TableBody className="[&_td]:border-[#80808040]">
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className={cn(
                  'cursor-pointer',
                  isModalDataTable &&
                    'hover:bg-white data-[state=selected]:bg-white'
                )}
                onClick={() => {
                  onRowClick?.(table, row)

                  const href = getHref?.(row.original)

                  if (href) {
                    router.push(href)
                  }
                }}
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as {
                    link: (row: TData) => string
                  }
                  const href = meta?.link(row.original)
                  return (
                    <TableCell
                      key={cell.id}
                      className="text-center md:p-4"
                      onClick={(e) => {
                        if (href) {
                          e.stopPropagation()
                          router.push(href as Route)
                        }
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  )
                })}
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

        {showFooter && (
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
