'use client'

import { gql } from '@generated'
import { GET_TAGS } from '@/app/admin/problem/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
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
import type { ColumnDef, SortingState } from '@tanstack/react-table'
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
      rowSelection
    },
    autoResetPageIndex: false,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  })

  const selectedRowCount = Object.values(rowSelection).filter(Boolean).length

  const DELETE_PROBLEM = gql(`
  mutation DeleteProblem($groupId: Int!, $id: Int!) {
    deleteProblem(groupId: $groupId, id: $id) {
      id
    }
  }
`)

  const DELETE_CONTEST = gql(`
    mutation DeleteContest($groupId: Int!, $contestId: Int!) {
      deleteContest(groupId: $groupId, contestId: $contestId) {
        id
      }
    }
`)

  const [deleteProblem] = useMutation(DELETE_PROBLEM)

  // TODO: notice도 같은 방식으로 추가
  const handleDeleteRows = async () => {
    const selectedRows = table.getSelectedRowModel().rows as {
      original: { id: number }
    }[]

    const deletePromise = selectedRows.map((row) => {
      if (page === 'problem') {
        return deleteProblem({
          variables: {
            groupId: 1,
            id: row.original.id
          }
        })
      } else if (page === 'contest') {
        return deleteContest({
          variables: {
            groupId: 1,
            contestId: row.original.id
          }
        })
      } else {
        return Promise.resolve()
      }
    })
    await Promise.all(deletePromise)
      .then(() => {
        setRowSelection({})
        router.refresh()
      })
      .catch(() => {
        toast.error(`Failed to delete ${page}`)
      })
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

          {table.getColumn('tag') && (
            <DataTableTagsFilter
              column={table.getColumn('tag')}
              title="Tags"
              options={tags}
            />
          )}
        </div>
        {selectedRowCount !== 0 ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <PiTrashLight fontSize={18} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to permanently delete {selectedRowCount}{' '}
                  {page}(s)?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button onClick={() => handleDeleteRows()}>Continue</Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button variant="outline">
            <PiTrashLight fontSize={18} />
          </Button>
        )}
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
