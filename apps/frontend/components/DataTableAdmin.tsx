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
import { useMutation, useQuery } from '@apollo/client'
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
import { PlusCircleIcon } from 'lucide-react'
import type { Route } from 'next'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { PiTrashLight } from 'react-icons/pi'
import { toast } from 'sonner'
import DataTableLangFilter from './DataTableLangFilter'
import { DataTablePagination } from './DataTablePagination'
import { DataTableTagsFilter } from './DataTableTagsFilter'
import { Input } from './ui/input'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  enableSearch?: boolean // Enable search title
  enableFilter?: boolean // Enable filter for languages and tags
  enableDelete?: boolean // Enable delete selected rows
  enablePagination?: boolean // Enable pagination
  enableImport?: boolean // Enable import selected rows
  checkSelectedRows?: boolean // Check selected rows
}

interface ContestProblem {
  index: number
  id: number
  title: string
  difficulty: string
}

const languageOptions = ['C', 'Cpp', 'Golang', 'Java', 'Python2', 'Python3']

let contestId: string | null = null

function Search() {
  const searchParams = useSearchParams()
  contestId = searchParams.get('contestId')
  return null
}

export function DataTableAdmin<TData, TValue>({
  columns,
  data,
  enableSearch = false,
  enableFilter = false,
  enableDelete = false,
  enablePagination = false,
  enableImport = false,
  checkSelectedRows = false
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const pathname = usePathname()
  const page = pathname.split('/').pop()
  const router = useRouter()
  const selectedRowCount = Object.values(rowSelection).filter(Boolean).length
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

  let deletingObject
  if (pathname === '/admin/contest') {
    deletingObject = 'contest'
  } else {
    deletingObject = 'problem'
  }

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
  const [deleteContest] = useMutation(DELETE_CONTEST)

  useEffect(() => {
    if (checkSelectedRows) {
      let importedProblems
      if (contestId === null) {
        importedProblems = localStorage.getItem('importProblems')
        if (!importedProblems) return
      } else {
        importedProblems = localStorage.getItem(`importProblems-${contestId}`)
        if (!importedProblems) return
      }
      const problems = JSON.parse(importedProblems)
      const problemIndex = problems.map(
        (problem: ContestProblem) => problem.index
      )
      setRowSelection(
        problemIndex.reduce(
          (acc: { [key: number]: boolean }, index: number) => ({
            ...acc,
            [index]: true
          }),
          {}
        )
      )
    }
  }, [checkSelectedRows])

  const handleImportProblems = async () => {
    const selectedProblems = table.getSelectedRowModel().rows as {
      original: { id: number; title: string; difficulty: string }
      index: number
    }[]
    const problems = selectedProblems.map((problem) => ({
      index: problem.index,
      id: problem.original.id,
      title: problem.original.title,
      difficulty: problem.original.difficulty
    }))
    if (contestId === null) {
      localStorage.setItem('importProblems', JSON.stringify(problems))
      router.push('/admin/contest/create')
    } else {
      localStorage.setItem(
        `importProblems-${contestId}`,
        JSON.stringify(problems)
      )
      router.push(`/admin/contest/${contestId}`)
    }
  }

  // TODO: notice도 같은 방식으로 추가
  const handleDeleteRows = async () => {
    const selectedRows = table.getSelectedRowModel().rows as {
      original: { id: number }
    }[]
    if (pathname === '/admin/contest/create') {
      const storedValue = localStorage.getItem('importProblems')
      const problems = storedValue ? JSON.parse(storedValue) : []
      const newProblems = problems.filter(
        (problem: ContestProblem) =>
          !selectedRows.some((row) => row.original.id === problem.id)
      )
      localStorage.setItem('importProblems', JSON.stringify(newProblems))
      // router.refresh 해도 새로고침이 안돼서 location.reload()로 대체
      location.reload()
      return
    } else if (pathname.includes('/admin/contest/')) {
      const contestId = page
      const storedValue = localStorage.getItem(`importProblems-${contestId}`)
      const problems = storedValue ? JSON.parse(storedValue) : []
      const newProblems = problems.filter(
        (problem: ContestProblem) =>
          !selectedRows.some((row) => row.original.id === problem.id)
      )
      localStorage.setItem(
        `importProblems-${contestId}`,
        JSON.stringify(newProblems)
      )
      location.reload()
      return
    }
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

  const { data: tagsData } = useQuery(GET_TAGS)
  const tags =
    tagsData?.getTags.map(({ id, name }) => ({ id: +id, name })) ?? []

  return (
    <div className="space-y-4">
      <Suspense>
        <Search />
      </Suspense>
      {(enableSearch || enableFilter || enableImport || enableDelete) && (
        <div className="flex justify-between">
          <div className="flex gap-2">
            {enableSearch && (
              <Input
                placeholder="Search"
                value={
                  (table.getColumn('title')?.getFilterValue() as string) ?? ''
                }
                onChange={(event) =>
                  table.getColumn('title')?.setFilterValue(event.target.value)
                }
                className="h-10 w-[150px] lg:w-[250px]"
              />
            )}
            {enableFilter && (
              <div className="flex gap-2">
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
            )}
          </div>
          {enableImport ? (
            <Button onClick={() => handleImportProblems()}>
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Import
            </Button>
          ) : null}
          {enableDelete ? (
            selectedRowCount !== 0 ? (
              <AlertDialog>
                <AlertDialogTrigger>
                  <Button variant="outline" type="button">
                    <PiTrashLight fontSize={18} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to permanently delete{' '}
                      {selectedRowCount} {deletingObject}(s)?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        onClick={() => handleDeleteRows()}
                        className="bg-red-500 hover:bg-red-500/90"
                      >
                        Delete
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button variant="outline" type="button">
                <PiTrashLight fontSize={18} />
              </Button>
            )
          ) : null}
        </div>
      )}

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
                  page === 'contest'
                    ? (`/admin/contest/${(row.original as { id: number }).id}` as Route)
                    : (`/admin/problem/${(row.original as { id: number }).id}` as Route)
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
      {enablePagination && <DataTablePagination table={table} />}
    </div>
  )
}
