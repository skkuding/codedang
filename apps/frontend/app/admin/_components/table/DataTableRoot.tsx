'use client'

import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef
} from '@tanstack/react-table'
import { isAfter, isBefore, isEqual, parseISO } from 'date-fns'
import type { ReactNode } from 'react'
import { DEFAULT_COLUMN_VISIBILITY } from './constants'
import { Provider } from './context'

interface DataTableRootProps<TData extends { id: number }, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  defaultSortState?: { id: string; desc: boolean }[]
  defaultPageSize?: number
  selectedRowIds?: number[]
  hiddenColumns?: string[]
  children: ReactNode
}

/**
 * 어드민 테이블 최상위 컴포넌트
 * @description Table instance를 생성하고 Context를 이용해 하위 컴포넌트에게 table instance를 제공합니다.
 * @param columns
 * header, cell, footer가 정의된 컬럼 목록
 * @param data
 * 테이블에서 보여줄 데이터
 * @param defaultPageSize
 * 한 페이지 당 보여줄 행 개수 (기본값: 10)
 * @param defaultSortState
 * 기본 정렬 상태
 * @param selectedRowIds
 * 선택된 행들의 아이디 목록
 */
export function DataTableRoot<TData extends { id: number }, TValue>({
  data,
  columns,
  defaultPageSize = 10,
  defaultSortState = [],
  selectedRowIds = [],
  hiddenColumns = [],
  children
}: DataTableRootProps<TData, TValue>) {
  const defaultRowSelection = Object.fromEntries(
    selectedRowIds.map((id) => [String(id), true])
  )

  const table = useReactTable({
    data,
    columns,
    defaultColumn: {
      minSize: 0,
      size: Number.MAX_SAFE_INTEGER,
      maxSize: Number.MAX_SAFE_INTEGER,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (Array.isArray(filterValue) && filterValue.length > 0) {
          const cellValue = String(row.getValue(columnId)).trim()
          return filterValue.includes(cellValue)
        }

        if (
          filterValue &&
          typeof filterValue === 'object' &&
          'type' in filterValue &&
          ('date' in filterValue ||
            'from' in filterValue ||
            'to' in filterValue)
        ) {
          const cellValue = row.getValue(columnId)
          if (!cellValue) {
            return false
          }

          let cellDate: Date
          try {
            cellDate =
              typeof cellValue === 'string'
                ? parseISO(cellValue)
                : new Date(cellValue as number)
          } catch {
            return false
          }

          const cellDateOnly = new Date(
            cellDate.getFullYear(),
            cellDate.getMonth(),
            cellDate.getDate()
          )

          if (filterValue.type === 'range') {
            const { from, to } = filterValue as { from?: Date; to?: Date }
            if (from && to) {
              const fromDate = new Date(
                from.getFullYear(),
                from.getMonth(),
                from.getDate()
              )
              const toDate = new Date(
                to.getFullYear(),
                to.getMonth(),
                to.getDate(),
                23,
                59,
                59,
                999
              )

              return cellDateOnly >= fromDate && cellDate <= toDate
            } else if (from) {
              const fromDate = new Date(
                from.getFullYear(),
                from.getMonth(),
                from.getDate()
              )
              return cellDateOnly >= fromDate
            } else if (to) {
              const toDate = new Date(
                to.getFullYear(),
                to.getMonth(),
                to.getDate(),
                23,
                59,
                59,
                999
              )
              return cellDate <= toDate
            }
          } else if (filterValue.type === 'single') {
            const { date } = filterValue as { date: Date }
            const singleDateStart = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate()
            )
            const singleDateEnd = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              23,
              59,
              59,
              999
            )

            return cellDateOnly >= singleDateStart && cellDate <= singleDateEnd
          }
        }

        if (
          filterValue &&
          typeof filterValue === 'object' &&
          'type' in filterValue &&
          ('value' in filterValue ||
            'min' in filterValue ||
            'max' in filterValue)
        ) {
          const cellValue = row.getValue(columnId)
          if (cellValue === null || cellValue === undefined) {
            return false
          }

          const cellNumber = parseFloat(String(cellValue))
          if (isNaN(cellNumber)) {
            return false
          }

          if (filterValue.type === 'range') {
            const { min, max } = filterValue as { min?: number; max?: number }
            if (min !== undefined && max !== undefined) {
              return cellNumber >= min && cellNumber <= max
            } else if (min !== undefined) {
              return cellNumber >= min
            } else if (max !== undefined) {
              return cellNumber <= max
            }
          } else if (filterValue.type === 'single') {
            const { value, operator } = filterValue as {
              value: number
              operator: string
            }
            switch (operator) {
              case 'eq':
                return cellNumber === value
              case 'gt':
                return cellNumber > value
              case 'gte':
                return cellNumber >= value
              case 'lt':
                return cellNumber < value
              case 'lte':
                return cellNumber <= value
              default:
                return false
            }
          }
        }

        if (typeof filterValue === 'string' && filterValue) {
          const cellValue = String(row.getValue(columnId)).trim()
          return cellValue.toLowerCase().includes(filterValue.toLowerCase())
        }

        return true
      }
    },
    initialState: {
      sorting: defaultSortState,
      pagination: {
        pageSize: defaultPageSize
      },
      rowSelection: defaultRowSelection,
      columnVisibility: hiddenColumns.length
        ? Object.fromEntries(hiddenColumns.map((col) => [col, false]))
        : DEFAULT_COLUMN_VISIBILITY
    },
    autoResetPageIndex: false,
    enableRowSelection: true,
    enableColumnFilters: true,
    getRowId: (row) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  })

  return (
    <Provider value={{ table }}>
      <div className="space-y-4">{children}</div>
    </Provider>
  )
}
