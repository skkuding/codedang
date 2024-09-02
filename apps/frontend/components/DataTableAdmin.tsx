'use client'

import DuplicateContest from '@/app/admin/contest/_components/DuplicateContest'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip'
import { DELETE_CONTEST } from '@/graphql/contest/mutations'
import { GET_BELONGED_CONTESTS } from '@/graphql/contest/queries'
import { DELETE_PROBLEM } from '@/graphql/problem/mutations'
import { getStatusWithStartEnd } from '@/lib/utils'
import { useLazyQuery, useMutation } from '@apollo/client'
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
import { CopyIcon } from 'lucide-react'
import type { Route } from 'next'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { IoSearch } from 'react-icons/io5'
import { PiTrashLight } from 'react-icons/pi'
import { toast } from 'sonner'
import DataTableLangFilter from './DataTableLangFilter'
import DataTableLevelFilter from './DataTableLevelFilter'
import { DataTablePagination } from './DataTablePagination'
import DataTableProblemFilter from './DataTableProblemFilter'
import { Input } from './ui/input'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  enableSearch?: boolean // Enable search title
  searchColumn?: string
  enableFilter?: boolean // Enable filter for languages and tags
  enableProblemFilter?: boolean // Enable filter for problems
  enableDelete?: boolean // Enable delete selected rows
  enablePagination?: boolean // Enable pagination
  enableRowsPerpage?: boolean
  enableImport?: boolean // Enable import selected rows
  enableDuplicate?: boolean // Enable duplicate selected rows
  checkedRows?: ContestProblem[] // Check selected rows
  headerStyle?: {
    [key: string]: string
  }
  onSelectedExport?: (selectedRows: ContestProblem[]) => void
  defaultSortColumn?: { id: string; desc: boolean }
  enableFooter?: boolean
  defaultPageSize?: number
}

interface ContestProblem {
  id: number
  title: string
  difficulty: string
}

interface SelectedContest {
  original: {
    id: number
    startTime: string
    endTime: string
  }
}

const languageOptions = ['C', 'Cpp', 'Java', 'Python3']
const levels = ['Level1', 'Level2', 'Level3', 'Level4', 'Level5']

export function DataTableAdmin<TData, TValue>({
  columns,
  data,
  enableSearch = false,
  searchColumn = 'title',
  enableFilter = false,
  enableProblemFilter = false,
  enableDelete = false,
  enablePagination = false,
  enableRowsPerpage = true,
  enableImport = false,
  checkedRows = [],
  headerStyle = {},
  enableDuplicate = false,
  onSelectedExport = () => {},
  defaultSortColumn = { id: '', desc: false },
  enableFooter = false,
  defaultPageSize = 10
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [defaultSortExists, setDefaultExists] = useState(defaultSortColumn.id)
  useEffect(() => {
    if (defaultSortExists)
      setSorting([{ id: defaultSortColumn.id, desc: defaultSortColumn.desc }])
    setDefaultExists('')
  }, [defaultSortExists, defaultSortColumn])
  const pathname = usePathname()
  const page = pathname.split('/').pop()
  const router = useRouter()
  const selectedRowCount = Object.values(rowSelection).filter(Boolean).length
  const table = useReactTable({
    data,
    columns,
    defaultColumn: {
      minSize: 0,
      size: Number.MAX_SAFE_INTEGER,
      maxSize: Number.MAX_SAFE_INTEGER
    },
    state: {
      sorting: enableImport
        ? [{ id: 'select', desc: true }, ...sorting]
        : sorting,
      rowSelection,
      columnVisibility: { languages: false }
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

  useEffect(() => {
    table.setPageSize(defaultPageSize)
  }, [defaultPageSize, table])

  let deletingObject
  if (pathname === '/admin/contest') {
    deletingObject = 'contest'
  } else {
    deletingObject = 'problem'
  }

  const [deleteProblem] = useMutation(DELETE_PROBLEM)
  const [deleteContest] = useMutation(DELETE_CONTEST)
  const [isDeleteAlertDialogOpen, setIsDeleteAlertDialogOpen] = useState(false)

  useEffect(() => {
    if (checkedRows.length !== 0) {
      const problemIds = checkedRows.map((problem) => problem.id)
      const problemIndex = data.reduce((acc: number[], problem, index) => {
        if (problemIds.includes((problem as { id: number }).id)) {
          acc.push(index as number)
        }
        return acc
      }, [])
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
  }, [checkedRows, data])

  const handleImportProblems = async () => {
    const selectedProblems = table.getSelectedRowModel().rows as {
      original: { id: number; title: string; difficulty: string; score: number }
    }[]
    const problems = selectedProblems.map((problem) => ({
      id: problem.original.id,
      title: problem.original.title,
      difficulty: problem.original.difficulty,
      score: problem.original.score ?? 0 // Score 기능 완료되면 수정해주세요!!
    }))
    onSelectedExport(problems)
  }

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

  const [fetchContests] = useLazyQuery(GET_BELONGED_CONTESTS)

  const handleDeleteButtonClick = async () => {
    if (page === 'problem') {
      const selectedRows = table.getSelectedRowModel().rows as {
        original: { id: number }
      }[]
      const promises = selectedRows.map((row) =>
        fetchContests({
          variables: {
            problemId: Number(row.original.id)
          }
        }).then((result) => result.data)
      )
      const results = await Promise.all(promises)
      const isAllSafe = !results.some((data) => data !== undefined)
      if (isAllSafe) {
        setIsDeleteAlertDialogOpen(true)
      } else {
        setIsDeleteAlertDialogOpen(false)
        toast.error('Failed :  Problem included in the contest')
      }
    } else {
      setIsDeleteAlertDialogOpen(true)
    }
  }

  return (
    <div className="space-y-4">
      <Suspense />
      {(enableSearch ||
        enableFilter ||
        enableImport ||
        enableDelete ||
        enableDuplicate) && (
        <div className="flex justify-between">
          <div className="flex gap-4">
            {enableSearch && (
              <div className="relative">
                <IoSearch className="text-muted-foreground absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search"
                  value={
                    (table
                      .getColumn(searchColumn)
                      ?.getFilterValue() as string) ?? ''
                  }
                  onChange={(event) => {
                    table
                      .getColumn(searchColumn)
                      ?.setFilterValue(event.target.value)
                    table.setPageIndex(0)
                  }}
                  className="h-10 w-[150px] bg-transparent pl-8 lg:w-[250px]"
                />
              </div>
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
                {table.getColumn('difficulty') && (
                  <DataTableLevelFilter
                    column={table.getColumn('difficulty')}
                    title="Level"
                    options={levels}
                  />
                )}
                {enableProblemFilter && (
                  <DataTableProblemFilter
                    column={
                      table.getColumn('title') ??
                      table.getColumn('problemTitle')
                    }
                  />
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {enableImport ? (
              <Button onClick={() => handleImportProblems()}>
                Import / Edit
              </Button>
            ) : null}
            {enableDuplicate ? (
              selectedRowCount === 1 ? (
                <DuplicateContest
                  contestId={
                    (table.getSelectedRowModel().rows[0] as SelectedContest)
                      ?.original.id
                  }
                  contestStatus={getStatusWithStartEnd(
                    (table.getSelectedRowModel().rows[0] as SelectedContest)
                      ?.original.startTime,
                    (table.getSelectedRowModel().rows[0] as SelectedContest)
                      ?.original.endTime
                  )}
                  groupId={1}
                />
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button variant="default" size="default" disabled>
                        <CopyIcon className="mr-2 h-4 w-4" />
                        Duplicate
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p> Select only one contest to duplicate</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            ) : null}
            {enableDelete ? (
              selectedRowCount !== 0 ? (
                <div>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleDeleteButtonClick}
                  >
                    <PiTrashLight fontSize={18} />
                  </Button>
                  <AlertDialog
                    open={isDeleteAlertDialogOpen}
                    onOpenChange={setIsDeleteAlertDialogOpen}
                  >
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
                </div>
              ) : (
                <Button variant="outline" type="button">
                  <PiTrashLight fontSize={18} />
                </Button>
              )
            ) : null}
          </div>
        </div>
      )}

      <div>
        <Table className="rounded border">
          <TableHeader className="bg-neutral-100 [&_tr]:border-b-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={headerStyle[header.id]}
                    >
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
                const participantRegex = /^\/admin\/contest\/\d+$/
                const href = (() => {
                  if (participantRegex.test(pathname)) {
                    return `${pathname}/participant/${(row.original as { userId: number }).userId}` as Route
                  }
                  if (page === 'contest') {
                    return `/admin/contest/${(row.original as { id: number }).id}` as Route
                  }
                  if (page === 'problem') {
                    return `/admin/problem/${(row.original as { id: number }).id}` as Route
                  }
                  if (page === 'submission') {
                    const submission = row.original as {
                      problemId: number
                      id: number
                    }
                    return `/contest/${pathname.split('/')[3]}/problem/${submission.problemId}/submission/${submission.id}` as Route
                  }
                  if (pathname.includes('participant') && enableProblemFilter) {
                    const submission = row.original as {
                      contestId: number
                      problemId: number
                      id: number
                    }
                    return `/contest/${submission.contestId}/problem/${submission.problemId}/submission/${submission.id}` as Route
                  }
                  return ''
                })()
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="cursor-pointer hover:bg-neutral-200/30"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="text-center md:p-4"
                        onClick={() => {
                          if (enableImport) {
                            const selectedRowCount =
                              table.getSelectedRowModel().rows.length
                            if (selectedRowCount < 20 || row.getIsSelected()) {
                              row.toggleSelected(!row.getIsSelected())
                            } else {
                              toast.error(
                                'You can only import up to 20 problems in a contest'
                              )
                            }
                          } else {
                            href && router.push(href)
                          }
                        }}
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
          {enableFooter && (
            <TableFooter>
              {table.getFooterGroups().map((footerGroup) => (
                <TableRow key={footerGroup.id}>
                  {footerGroup.headers.map((footer) => {
                    return (
                      <TableHead
                        key={footer.id}
                        className={headerStyle[footer.id]}
                      >
                        {footer.isPlaceholder
                          ? null
                          : flexRender(
                              footer.column.columnDef.footer,
                              footer.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableFooter>
          )}
        </Table>
      </div>
      {enablePagination && (
        <DataTablePagination
          table={table}
          showRowsPerPage={enableRowsPerpage}
        />
      )}
    </div>
  )
}
