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
import { Provider } from './context'

interface DataTableRootProps<TData extends { id: number }, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  defaultSortState?: { id: string; desc: boolean }[]
  defaultPageSize?: number
  selectedRowIds?: number[]
  children: ReactNode
}

export default function DataTableRoot<TData extends { id: number }, TValue>({
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
      columnVisibility: { languages: false }
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
