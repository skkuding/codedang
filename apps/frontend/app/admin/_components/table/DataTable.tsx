'use client'

import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
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
  isCardView?: boolean
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
  size?: 'sm' | 'md' | 'lg'
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

const headerSizeMap = {
  sm: '!h-[30px]',
  md: '!h-[39px]',
  lg: '!h-[40px]'
}

const bodySizeMap = {
  sm: '!h-[40px]',
  md: '!h-[57px]',
  lg: '!h-[76px]'
}

export function DataTable<TData extends { id: number }, TRoute extends string>({
  headerStyle = {},
  showFooter = false,
  isModalDataTable = false,
  isCardView = false,
  getHref,
  onRowClick,
  size = 'md'
}: DataTableProps<TData, TRoute>) {
  const router = useRouter()
  const { table } = useDataTable<TData>()

  if (isCardView) {
    // isCardView가 true일 때 반환
    return (
      <ScrollArea className="max-w-full rounded">
        <Table>
          <TableBody className="[&_td]:border-transparent">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="cursor-pointer hover:bg-transparent"
                  onClick={() => {
                    onRowClick?.(table, row)
                    const href = getHref?.(row.original)
                    if (href) {
                      router.push(href)
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="h-[40px] text-center md:px-0 md:py-2"
                    >
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
                  colSpan={Number(table.getAllColumns().length)}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    )
  }

  // isCardView가 false일 때 반환
  return (
    <ScrollArea className="max-w-full rounded">
      <Table>
        <TableHeader
          className={cn(
            '[&_td]:border-[#80808040]',
            isModalDataTable && 'border-b-0'
          )}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className={cn(isModalDataTable && 'bg-neutral-200/30')}
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(headerStyle[header.id], headerSizeMap[size])}
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
        <TableBody className="[&_td]:border-[#80808040]">
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className={cn(
                  'cursor-pointer',
                  isModalDataTable &&
                    'hover:bg-white data-[state=selected]:bg-white',
                  'hover:bg-neutral-200/30'
                )}
                onClick={() => {
                  onRowClick?.(table, row)
                  const href = getHref?.(row.original)
                  if (href) {
                    router.push(href)
                  }
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(bodySizeMap[size], 'text-center md:p-4')}
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
