'use client'

import CheckboxSelect from '@/components/CheckboxSelect'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { fetcherGql } from '@/lib/utils'
import { gql } from '@apollo/client'
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState
} from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Route } from 'next'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { DataTablePagination } from './DataTablePagination'
import { Input } from './ui/input'

interface Tag {
  id: number
  name: string
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

const GET_TAGS = gql`
  query GetTags {
    getTags {
      id
      name
    }
  }
`

// dummy data
const languageOptions = ['C', 'Cpp', 'Golang', 'Java', 'Python2', 'Python3']

export function DataTableAdmin<TData, TValue>({
  columns,
  data
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [tags, setTags] = useState<Tag[]>([])

  const router = useRouter()

  useEffect(() => {
    fetcherGql(GET_TAGS).then((data) => {
      const transformedData = data.getTags.map(
        (tag: { id: string; name: string }) => ({
          ...tag,
          id: Number(tag.id)
        })
      )
      setTags(transformedData)
    })
  }, [])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  })
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search"
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className="h-10 w-[150px] lg:w-[250px]"
        />

        {table.getColumn('languages') && (
          <CheckboxSelect
            title="Language"
            options={languageOptions}
            onChange={() => {}}
          />
        )}

        {table.getColumn('tags') && (
          <DataTableFacetedFilter
            column={table.getColumn('tags')}
            title="Tags"
            options={tags}
          />
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const href =
                  `/admin/problem/${(row.original as { id: number }).id}` as Route
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="cursor-pointer hover:bg-gray-200"
                    onClick={() => router.push(href)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="md:p-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
