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
  bodyStyle?: Record<string, string>
  showFooter?: boolean
  isHeaderGrouped?: boolean
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

const headerStyleMap = {
  sm: 'h-[30px]! text-sm font-medium',
  md: 'h-[39px]! text-sm font-normal',
  lg: 'h-[40px]! text-base font-medium'
}

const bodyStyleMap = {
  sm: 'h-[40px]! text-sm font-normal',
  md: 'h-[57px]! text-sm font-normal',
  lg: 'h-[76px]! text-base font-normal'
}

export function DataTable<TData extends { id: number }, TRoute extends string>({
  bodyStyle = {},
  showFooter = false,
  isHeaderGrouped = false,
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
      <ScrollArea className="rounded-xs max-w-full">
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
                      className="h-[40px] whitespace-nowrap text-center md:px-0 md:py-2"
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
    <ScrollArea className="rounded-xs max-w-full">
      <Table>
        <TableHeader className="border-b-0">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              // className={cn(isHeaderGrouped && 'bg-background-alternative')}
            >
              {headerGroup.headers.map((header, index) => (
                <TableHead
                  key={header.id}
                  className={cn(isHeaderGrouped && 'p-0')}
                >
                  <div
                    className={cn(
                      headerStyleMap[size],
                      !isHeaderGrouped
                        ? 'rounded-full bg-neutral-200/30 [&:has([role=checkbox])]:bg-transparent'
                        : 'bg-background-alternative',
                      isHeaderGrouped && index === 0 && 'rounded-l-full',
                      isHeaderGrouped &&
                        index === headerGroup.headers.length - 1 &&
                        'rounded-r-full',
                      'flex items-center justify-center whitespace-nowrap [&:has([role=checkbox])]:w-14'
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </div>
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
                className={cn('cursor-pointer', 'hover:bg-neutral-200/30')}
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
                    className={cn(
                      bodyStyleMap[size],
                      'md:p-4 [&:has([role=checkbox])]:w-14'
                    )}
                  >
                    <div
                      className={cn(
                        'flex justify-center whitespace-nowrap',
                        bodyStyle[cell.column.id]
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
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
                  <TableHead key={footer.id}>
                    <div
                      className={cn(
                        headerStyleMap[size],
                        !isHeaderGrouped && 'flex items-center justify-center'
                      )}
                    >
                      {footer.isPlaceholder
                        ? null
                        : flexRender(
                            footer.column.columnDef.footer,
                            footer.getContext()
                          )}
                    </div>
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
