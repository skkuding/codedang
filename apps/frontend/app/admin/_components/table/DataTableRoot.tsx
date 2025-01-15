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
import type { ReactNode } from 'react'
import { DEFAULT_COLUMN_VISIBILITY } from './constants'
import { Provider } from './context'

interface DataTableRootProps<TData extends { id: number }, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  defaultSortState?: { id: string; desc: boolean }[]
  defaultPageSize?: number
  selectedRowIds?: number[]
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
      maxSize: Number.MAX_SAFE_INTEGER
    },
    initialState: {
      sorting: defaultSortState,
      pagination: {
        pageSize: defaultPageSize
      },
      rowSelection: defaultRowSelection,
      columnVisibility: DEFAULT_COLUMN_VISIBILITY
    },
    autoResetPageIndex: false,
    enableRowSelection: true,
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
