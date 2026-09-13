'use client'

import {
  DataTablePagination,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { useDataTable } from '@/app/admin/_components/table/context'
import { Button } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'
import CheckBoxIcon from '@/public/icons/check-box.svg'
import SortIcon from '@/public/icons/sort.svg'
import { NoticeModalTitle } from './NoticeModal'
import type { NoticeItem } from './importNoticeTableColumns'

interface ImportNoticeTableContentProps {
  onImportSelected: (ids: number[]) => void
  isImporting: boolean
  isLoadingNotices: boolean
}

const gridTemplate = 'grid-cols-[minmax(0,1fr)_100px_160px_110px]'

export function ImportNoticeTableContent({
  onImportSelected,
  isImporting,
  isLoadingNotices
}: ImportNoticeTableContentProps) {
  const { table } = useDataTable<NoticeItem>()
  const selectedRows = table.getSelectedRowModel().rows
  const rows = table.getRowModel().rows
  const dateColumn = table.getColumn('date')
  const dateSort = dateColumn?.getIsSorted()
  const creatorColumn = table.getColumn('creator')
  const creatorSort = creatorColumn?.getIsSorted()

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <NoticeModalTitle className="text-head4_m_28">
        Import Notice
      </NoticeModalTitle>

      <div className="flex items-center justify-between">
        <DataTableSearchBar
          columndId="title"
          sizeVariant="sm"
          className="w-[400px]! rounded-full"
        />

        <Button
          onClick={() =>
            onImportSelected(selectedRows.map((row) => row.original.id))
          }
          disabled={selectedRows.length === 0 || isImporting}
          className="bg-primary hover:bg-primary-strong text-caption3_r_13 h-[34px] rounded-full px-[18px] text-white"
        >
          <CheckBoxIcon className="mr-1 size-4" />
          Import
        </Button>
      </div>

      {isLoadingNotices && (
        <div className="text-caption3_r_13 flex h-40 items-center justify-center text-gray-400">
          Loading...
        </div>
      )}

      {!isLoadingNotices && (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mb-[-4px] mt-1 min-w-[600px]">
            <div
              className={cn(
                'bg-color-neutral-99 text-caption3_r_13 text-color-neutral-60 grid h-[30px] items-center gap-[10px] rounded-full',
                gridTemplate
              )}
            >
              <div className="flex w-full justify-center px-10">Title</div>
              <button
                type="button"
                onClick={() => dateColumn?.toggleSorting(dateSort === 'asc')}
                className="w-25 flex items-center justify-center gap-2 pl-5 pr-4"
              >
                Date
                <SortIcon className="size-3" />
              </button>
              <div className="flex w-40 justify-center px-10">Course</div>
              <button
                type="button"
                onClick={() =>
                  creatorColumn?.toggleSorting(creatorSort === 'asc')
                }
                className="flex w-[110px] items-center gap-2 pl-5 pr-4"
              >
                Creator
                <SortIcon className="size-3" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="min-w-[600px]">
              {rows.length > 0 ? (
                rows.map((row, index) => {
                  const item = row.original
                  return (
                    <div
                      key={row.id}
                      onClick={() => row.toggleSelected()}
                      className={cn(
                        'text-body4_r_14 text-color-neutral-40 grid h-14 cursor-pointer items-center gap-[10px] px-[10px]',
                        gridTemplate,
                        index !== rows.length - 1 && 'border-line border-b'
                      )}
                    >
                      <div className="flex items-center gap-[2px]">
                        <button
                          type="button"
                          aria-label={
                            row.getIsSelected()
                              ? `Deselect ${item.title}`
                              : `Select ${item.title}`
                          }
                          onClick={(e) => {
                            e.stopPropagation()
                            row.toggleSelected(!row.getIsSelected())
                          }}
                          className="flex size-10 shrink-0 items-center justify-center"
                        >
                          {row.getIsSelected() ? (
                            <CheckBoxIcon className="text-primary size-6" />
                          ) : (
                            <span className="border-color-neutral-70 size-5 rounded-[4px] border bg-white" />
                          )}
                        </button>
                        <span className="truncate text-black">
                          {item.title}
                        </span>
                      </div>
                      <div className="flex justify-center truncate px-[10px]">
                        {item.date ? item.date.slice(0, 10) : '-'}
                      </div>
                      <div className="flex justify-center truncate px-[10px]">
                        {item.course}
                      </div>
                      <div className="flex justify-center truncate px-[10px]">
                        {item.creator}
                      </div>
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

          <DataTablePagination showRowsPerPage={false} />
        </div>
      )}
    </div>
  )
}
