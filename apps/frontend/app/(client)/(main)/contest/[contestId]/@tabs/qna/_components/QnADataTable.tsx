'use client'

import type { GetContestProblemListResponse } from '@/app/(client)/_libs/apis/contestProblem'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { cn } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { Route } from 'next'
import type { Session } from 'next-auth'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { QnACategoryFilter } from './QnACategoryFilter'
import type { QnAItem } from './QnAMainColumns'
import { QnAPostButton } from './QnAPostButton'
import { SearchBar } from './SearchBar'

interface Item extends QnAItem {
  order: number
  status?: string
  id: number
}

interface QnADataTableProps<TData, TValue> {
  contestId: string
  columns: ColumnDef<TData, TValue>[]
  search: string
  orderBy: string
  categories: string
  problemOrders: string
  QnADataWithCategory: TData[]
  contestProblems: GetContestProblemListResponse
  headerStyle: {
    [key: string]: string
  }
  linked?: boolean
  emptyMessage?: string
  itemsPerPage: number
  currentPage: number
  setFilteredData: (data: TData[]) => void
  resetPageIndex: () => void
  session: Session | null
  isPrivilegedRole: boolean
  canCreateQnA: boolean
}

export function QnADataTable<TData extends Item, TValue>({
  contestId,
  columns,
  QnADataWithCategory,
  contestProblems,
  search,
  headerStyle,
  linked = true,
  emptyMessage = 'No results.',
  itemsPerPage,
  currentPage,
  setFilteredData,
  resetPageIndex,
  session,
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

  useEffect(() => {
    setFilteredData(table.getFilteredRowModel().rows.map((row) => row.original))
  }, [setFilteredData, table])

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedItems = table
    .getFilteredRowModel()
    .rows.slice(startIndex, startIndex + itemsPerPage)

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
        ...prev.filter((o) => o.value === 'General'),
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
          <SearchBar className="!w-full" height="lg" fontSize="lg" />
          <QnACategoryFilter
            column={table.getColumn('category')}
            contestId={Number(contestId)}
            options={options}
            resetPageIndex={resetPageIndex}
          />
          <QnAPostButton
            canCreateQnA={canCreateQnA}
            href={`/contest/${contestId}/qna/create`}
            className="flex h-[46px] flex-[1_0_0] items-center justify-center gap-[6px] px-6 py-3 text-base font-medium tracking-[-0.48px]"
          />
        </div>
      </div>
      <Table className="table-fixed !border-separate border-spacing-y-[10px]">
        <TableHeader className="!border-b-0 bg-[#F5F5F5]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    'rounded-full bg-[#F5F5F5] px-4 py-2 text-[16px] font-medium leading-[140%] tracking-[-0.48px] text-[#8A8A8A]',
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
              const href =
                `${currentPath}/${row.original.order}${search ? `?search=${search}` : ''}` as Route

              const handleClick = linked
                ? () => router.push(href)
                : (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
                    e.currentTarget.classList.toggle('expanded')
                  }

              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={`cursor-pointer border-b-[1.5px] border-neutral-200`}
                  onClick={handleClick}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="align-top">
                      <div
                        className={cn(
                          'font-pretendard flex items-center gap-[10px] overflow-hidden text-ellipsis text-[16px] text-xs font-normal leading-[150%] tracking-[-0.48px] text-black [-webkit-box-orient:vertical] [-webkit-line-clamp:1] [display:-webkit-box] md:text-sm',
                          cell.column.id === 'title'
                            ? 'text-left'
                            : 'justify-center text-center',
                          [
                            'category',
                            'createTime',
                            'createdBy.username'
                          ].includes(
                            (cell.column.columnDef as { accessorKey?: string })
                              .accessorKey ?? ''
                          )
                            ? 'text-[#808080]'
                            : 'text-black'
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
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
                      <Link href={href} />
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
