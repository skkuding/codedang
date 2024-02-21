'use client'

import { gql } from '@generated'
import { GET_TAGS } from '@/app/admin/problem/utils'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useQuery, useMutation } from '@apollo/client'
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
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { PiTrashLight } from 'react-icons/pi'
import { toast } from 'sonner'
import DataTableLangFilter from './DataTableLangFilter'
import { DataTablePagination } from './DataTablePagination'
import { DataTableTagsFilter } from './DataTableTagsFilter'
import { Input } from './ui/input'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

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
  const pathname = usePathname()
  const page = pathname.split('/').pop()

  const router = useRouter()

  const { data: tagsData } = useQuery(GET_TAGS)
  const tags =
    tagsData?.getTags.map(({ id, name }) => ({ id: +id, name })) ?? []

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

  const DELETE_PROBLEM = gql(`
  mutation DeleteProblem($groupId: Int!, $id: Int!) {
    deleteProblem(groupId: $groupId, id: $id) {
      id
    }
  }
`)

  const [deleteProblem, { error }] = useMutation(DELETE_PROBLEM)

  // TODO: contest랑 notice도 같은 방식으로 추가
  const handleDeleteRows = async () => {
    const selectedRows = table.getSelectedRowModel().rows as {
      original: { id: number }
    }[]
    const rowIds = selectedRows.map((row) => row.original.id)
    setRowSelection({})
    for (const id of rowIds) {
      if (page === 'problem') {
        await deleteProblem({
          variables: {
            groupId: 1,
            id
          }
        })
      } else {
        console.log('delete', id)
      }
    }
    if (error) {
      toast.error(`Failed to delete ${page}`)
      return
    }
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
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
            <DataTableLangFilter
              column={table.getColumn('languages')}
              title="Languages"
              options={languageOptions}
            />
          )}

          {table.getColumn('problemTag') && (
            <DataTableTagsFilter
              column={table.getColumn('problemTag')}
              title="Tags"
              options={tags}
            />
          )}
        </div>
        <Button onClick={() => handleDeleteRows()} variant="outline">
          <PiTrashLight fontSize={18} />
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="[&_tr]:border-b-gray-200">
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
                  `/admin/${page}/${(row.original as { id: number }).id}` as Route
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="cursor-pointer hover:bg-gray-200"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="md:p-4"
                        onClick={
                          cell.column.id === 'title'
                            ? () => router.push(href)
                            : undefined
                        }
                      >
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
