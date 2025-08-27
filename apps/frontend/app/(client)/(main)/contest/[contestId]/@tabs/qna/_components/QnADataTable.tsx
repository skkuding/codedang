'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { cn } from '@/libs/utils'
import type { ProblemDataTop } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { Session } from 'next-auth'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { QnACategoryFilter } from './QnACategoryFilter'
import type { QnAItem } from './QnAMainTable'
import { QnAPostButton } from './QnAPostButton'
import { SearchBar } from './SearchBar'

interface QnADataTableProps<TData, TValue> {
  session: Session | null
  contestId: number
  columns: ColumnDef<TData, TValue>[]
  QnADataWithCategory: TData[]
  contestProblems: ProblemDataTop
  headerStyle: {
    [key: string]: string
  }
  emptyMessage?: string
  itemsPerPage: number
  currentPage: number
  setFilteredData: (data: TData[]) => void
  resetPageIndex: () => void
  isPrivilegedRole: boolean
  canCreateQnA: boolean | null
}

export function QnADataTable<TData extends QnAItem, TValue>({
  session,
  contestId,
  columns,
  QnADataWithCategory,
  contestProblems,
  headerStyle,
  emptyMessage,
  itemsPerPage,
  currentPage,
  setFilteredData,
  resetPageIndex,
  isPrivilegedRole,
  canCreateQnA
}: QnADataTableProps<TData, TValue>) {
  const table = useReactTable({
    data: QnADataWithCategory ?? [],
    columns,
    getRowId: (row) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  })

  const router = useRouter()
  const currentPath = usePathname()

  const filteredRows = table.getFilteredRowModel().rows
  const filteredData = filteredRows.map((row) => row.original)
  useEffect(() => {
    setFilteredData(filteredData)
  }, [filteredData.length, setFilteredData])

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = filteredRows.slice(startIndex, endIndex)

  const [options, setOptions] = useState<
    { value: string; label: React.ReactNode }[]
  >([{ value: 'General', label: 'General' }])

  useEffect(() => {
    if (contestProblems?.data) {
      const problemOptions = contestProblems.data.map((item, index) => ({
        value: `${String.fromCharCode(65 + index)}. ${item.title}`,
        label: `${String.fromCharCode(65 + index)}. ${item.title}`
      }))
      setOptions((prev) => [
        ...prev.filter((option) => option.value === 'General'),
        ...problemOptions
      ])
    }
  }, [contestProblems])

  return (
    <div className="flex flex-col items-start gap-10">
      <div className="flex flex-col items-start gap-6 self-stretch">
        <div className="flex flex-col items-start gap-1.5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold leading-[140%] tracking-[-0.72px]">
              QUESTION & ANSWER
            </h1>
          </div>
          <p className="text-base font-medium tracking-[-0.48px] text-[#9B9B9B]">
            본 Q&A는 해당 대회와 관련된 질문만 작성해 주세요. 욕설, 비방, 대회
            진행에 방해가 되는 내용은 제재 대상이 될 수 있습니다.
          </p>
        </div>
        <div className="flex h-[46px] items-center items-stretch gap-2.5 self-stretch">
          <SearchBar
            className="!w-full !max-w-none"
            height="lg"
            fontSize="lg"
          />
          <QnACategoryFilter
            column={table.getColumn('category')}
            contestId={contestId}
            options={options}
            resetPageIndex={resetPageIndex}
          />
          <QnAPostButton contestId={contestId} canCreateQnA={canCreateQnA} />
        </div>
      </div>
      <Table className="mb-7 table-fixed">
        <TableHeader className="h-10 !border-b-0">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    header.id === 'id' ||
                      header.id === 'category' ||
                      header.id === 'title' ||
                      header.id === 'writer' ||
                      header.id === 'createTime'
                      ? 'rounded-full bg-[#F5F5F5] px-4 py-2 text-[16px] font-medium leading-[140%] tracking-[-0.48px] text-[#8A8A8A]'
                      : 'w-[4px] bg-white px-0',
                    headerStyle[header.id]
                  )}
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
        <TableBody>
          <TableRow className="hover:bg-transparent">
            <TableCell
              colSpan={columns.length}
              className="h-[10px] border-none !p-0"
            />
          </TableRow>
        </TableBody>
        <TableBody>
          {paginatedItems.length ? (
            paginatedItems.map((row) => {
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={`cursor-pointer border-b-[1.5px] border-neutral-200`}
                  onClick={() =>
                    router.push(`${currentPath}/${row.original.order}`)
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="!px-0" key={cell.id}>
                      <div
                        className={cn(
                          'items-center gap-[10px] !text-base tracking-[-0.48px] md:!text-sm',
                          cell.column.id === 'title'
                            ? 'flex text-left'
                            : 'text-center',
                          ['category', 'createTime', 'writer'].includes(
                            (cell.column.columnDef as { accessorKey: string })
                              .accessorKey ?? ''
                          )
                            ? 'text-[#808080]'
                            : 'text-black'
                        )}
                      >
                        <div
                          className={cn(
                            'truncate',
                            cell.column.id === 'title' ||
                              cell.column.id === 'createTime'
                              ? 'max-w-[482px]'
                              : 'max-w-[190px] px-[35px]'
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                        {cell.column.id === 'title' &&
                          session &&
                          (isPrivilegedRole
                            ? !row.original.isResolved && (
                                <div className="bg-primary h-2 w-2 rounded-full" />
                              )
                            : !row.original.isRead && (
                                <div className="bg-primary h-2 w-2 rounded-full" />
                              ))}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
