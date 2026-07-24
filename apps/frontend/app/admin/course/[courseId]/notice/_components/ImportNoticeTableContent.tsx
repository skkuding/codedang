'use client'

import {
  DataTablePagination,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { useDataTable } from '@/app/admin/_components/table/context'
import { Button } from '@/components/shadcn/button'
import { Checkbox } from '@/components/shadcn/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { cn } from '@/libs/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { FaCheck } from 'react-icons/fa'
import { NoticeModalTitle } from './NoticeModal'
import type { NoticeItem } from './importNoticeTableColumns'

interface ImportableCourse {
  id: string
  groupName: string
}

interface ImportNoticeTableContentProps {
  order: string
  onOrderChange: (order: string) => void
  onImportSelected: (ids: number[]) => void
  isImporting: boolean
  importableCourses: ImportableCourse[]
  sourceCourseId: string
  onSourceCourseIdChange: (courseId: string) => void
  isLoadingNotices: boolean
}

const gridTemplate = 'grid-cols-[minmax(0,1fr)_160px_160px_140px]'

export function ImportNoticeTableContent({
  order,
  onOrderChange,
  onImportSelected,
  isImporting,
  importableCourses,
  sourceCourseId,
  onSourceCourseIdChange,
  isLoadingNotices
}: ImportNoticeTableContentProps) {
  const { table } = useDataTable<NoticeItem>()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const rows = table.getRowModel().rows
  const dateColumn = table.getColumn('date')
  const dateSort = dateColumn?.getIsSorted()
  const creatorColumn = table.getColumn('creator')
  const creatorSort = creatorColumn?.getIsSorted()

  return (
    <>
      <NoticeModalTitle className="text-head4_m_28 text-color-common-0">
        Import Notice
      </NoticeModalTitle>

      <div className="flex items-center gap-3">
        <span className="text-sub4_sb_14 whitespace-nowrap">Import from</span>
        <Select
          value={sourceCourseId}
          onValueChange={onSourceCourseIdChange}
          disabled={importableCourses.length === 0}
        >
          <SelectTrigger className="h-9 max-w-[360px] rounded-full">
            <SelectValue
              placeholder={
                importableCourses.length === 0
                  ? 'No other course to import from'
                  : 'Select a course'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {importableCourses.map((course) => (
              <SelectItem key={course.id} value={String(course.id)}>
                {course.groupName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DataTableSearchBar
            columndId="title"
            sizeVariant="sm"
            className="w-[400px]! rounded-full"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 rounded-full px-4 text-sm font-normal"
              >
                Order
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={() => onOrderChange('latest')}
                className={order === 'latest' ? 'font-semibold' : ''}
              >
                Latest
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onOrderChange('oldest')}
                className={order === 'oldest' ? 'font-semibold' : ''}
              >
                Oldest
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          onClick={() =>
            onImportSelected(selectedRows.map((row) => row.original.id))
          }
          disabled={selectedRows.length === 0 || isImporting}
          className="bg-primary hover:bg-primary-strong text-caption3_r_13 h-8 rounded-full px-4 text-white"
        >
          <FaCheck className="mr-2 h-3.5 w-3.5" />
          Import
        </Button>
      </div>

      {!sourceCourseId && (
        <div className="flex h-40 items-center justify-center text-sm text-gray-400">
          Select a course to see its notices.
        </div>
      )}

      {sourceCourseId && isLoadingNotices && (
        <div className="flex h-40 items-center justify-center text-sm text-gray-400">
          Loading...
        </div>
      )}

      {sourceCourseId && !isLoadingNotices && (
        <>
          <div className="px-10">
            <div className="min-w-[600px]">
              <div
                className={cn(
                  'bg-color-neutral-80 text-color-neutral-60 grid items-center gap-10 rounded-full',
                  gridTemplate
                )}
              >
                <div className="px-10">Title</div>
                <button
                  type="button"
                  onClick={() => dateColumn?.toggleSorting(dateSort === 'asc')}
                  className="flex items-center gap-2 py-2 pl-5 pr-4"
                >
                  Date
                  {dateSort === 'asc' ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
                <div className="px-10">Course</div>
                <button
                  type="button"
                  onClick={() =>
                    creatorColumn?.toggleSorting(creatorSort === 'asc')
                  }
                  className="flex items-center gap-2 py-2 pl-5 pr-4"
                >
                  Creator
                  {creatorSort === 'asc' ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <div>
                {rows.length > 0 ? (
                  rows.map((row, index) => {
                    const item = row.original
                    return (
                      <div
                        key={row.id}
                        onClick={() => row.toggleSelected()}
                        className={cn(
                          'text-body2_r_14 grid cursor-pointer items-center gap-[10px] py-2',
                          gridTemplate,
                          index !== rows.length - 1 && 'border-line border-b'
                        )}
                      >
                        <div className="flex items-center gap-[2px]">
                          <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) =>
                              row.toggleSelected(Boolean(value))
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="truncate">{item.title}</span>
                        </div>
                        <div className="truncate px-[10px]">
                          {item.date ? item.date.slice(0, 10) : '-'}
                        </div>
                        <div className="truncate px-[10px]">{item.course}</div>
                        <div className="truncate px-[10px]">{item.creator}</div>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex h-[160px] items-center justify-center text-sm text-gray-400">
                    No notices found.
                  </div>
                )}
              </div>
            </div>
          </div>

          <DataTablePagination showRowsPerPage={false} />
        </>
      )}
    </>
  )
}
