'use client'

import { Button } from '@/components/shadcn/button'
import { Checkbox } from '@/components/shadcn/checkbox'
import { SearchInput } from '@/components/shadcn/search-input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { dateFormatter } from '@/libs/utils'
import PenIcon from '@/public/icons/pen.svg'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import { blueprintNoticeKeys } from '../_libs/noticeQueries'
import { blueprintListHref } from '../_libs/routes'
import { useBlueprintRead } from '../_libs/useBlueprintRead'
import { BlueprintListPagination } from './BlueprintListPagination'
import { useBlueprintNoticeDataSource } from './BlueprintNoticeDataSourceProvider'
import { BlueprintNoticeDeleteDialog } from './BlueprintNoticeDeleteDialog'
import { BlueprintNoticeEditor } from './BlueprintNoticeEditor'
import { useBlueprintNoticeWorkspace } from './BlueprintNoticeWorkspace'
import { BlueprintReadBoundary } from './BlueprintReadBoundary'

const columns = [
  { title: 'No', className: 'w-16' },
  { title: 'Title', className: 'min-w-[220px]' },
  { title: 'Date', className: 'w-[112px]' },
  { title: 'Edit', className: 'w-[84px]' }
] as const

export function BlueprintNoticeListRoute() {
  const { blueprintId, location, scope, viewState } =
    useBlueprintNoticeWorkspace()
  const source = useBlueprintNoticeDataSource()
  const state = useBlueprintRead(
    blueprintNoticeKeys.list(scope),
    source ? () => source.readNotices(scope) : null
  )
  const router = useRouter()
  const searchId = useId()
  const editorTrigger = useRef<HTMLElement | null>(null)
  const scopeKey = `${blueprintId}:notice:${location.cursor}:${location.take}:${location.page}`
  const [editor, setEditor] = useState<{
    scopeKey: string
    noticeId: number | null
  } | null>(null)
  const [deleting, setDeleting] = useState<{
    scopeKey: string
    targets: readonly { id: number; title: string }[]
  } | null>(null)
  const page = state?.status === 'success' ? state.data : null
  const notices = page?.items ?? null
  const { value, onChange } = viewState
  const selected = new Set(value.selectedIds)
  const visible = (notices ?? []).filter((notice) =>
    notice.title
      .toLocaleLowerCase()
      .includes(value.search.trim().toLocaleLowerCase())
  )
  const selectedNotices = (notices ?? []).filter((notice) =>
    selected.has(notice.id)
  )
  const visibleSelected = visible.filter((notice) => selected.has(notice.id))
  const hasNext =
    page !== null &&
    page.hasNextPage &&
    page.nextCursor !== null &&
    page.nextCursor !== location.cursor
  const hasPrevious =
    page !== null &&
    location.page > 1 &&
    page.previousCursor !== undefined &&
    page.previousCursor !== location.cursor

  useEffect(() => {
    setEditor(null)
    setDeleting(null)
    editorTrigger.current = null
  }, [scopeKey])

  useEffect(() => {
    if (notices === null) {
      return
    }
    const available = new Set(notices.map((notice) => notice.id))
    onChange((current) => {
      const selectedIds = current.selectedIds.filter((id) => available.has(id))
      return selectedIds.length === current.selectedIds.length
        ? current
        : { ...current, selectedIds }
    })
  }, [notices, onChange])

  function openEditor(noticeId: number | null, trigger: HTMLElement) {
    editorTrigger.current = trigger
    setEditor({ scopeKey, noticeId })
  }

  return (
    <section aria-label="Blueprint notices">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <label htmlFor={searchId} className="sr-only">
            Search this page
          </label>
          <SearchInput
            id={searchId}
            value={value.search}
            onChange={(event) => {
              const search = event.currentTarget.value
              onChange((current) => ({ ...current, search }))
            }}
            disabled={notices === null}
            placeholder="Search"
            sizeVariant="lg"
            aria-describedby={`${searchId}-scope`}
          />
        </div>
        <Button
          type="button"
          className="h-[46px] shrink-0 rounded-[10px]"
          onClick={(event) => openEditor(null, event.currentTarget)}
        >
          Create
        </Button>
      </div>
      <p id={`${searchId}-scope`} className="mt-1 text-xs text-neutral-600">
        Searches this page only.
      </p>
      {state === null && (
        <p role="status" className="mt-7">
          Blueprint Notice data is not connected.
        </p>
      )}
      {state !== null && (
        <BlueprintReadBoundary state={state}>
          {(data) => (
            <>
              <Button
                type="button"
                variant="destructive"
                className="mt-7"
                disabled={selectedNotices.length === 0}
                onClick={(event) => {
                  event.currentTarget.focus()
                  setDeleting({
                    scopeKey,
                    targets: selectedNotices.map(({ id, title }) => ({
                      id,
                      title
                    }))
                  })
                }}
              >
                Delete ({selectedNotices.length})
              </Button>
              <div className="mt-7">
                <Table>
                  <TableHeader className="border-b-0">
                    <TableRow>
                      <TableHead className="w-14">
                        <Checkbox
                          aria-label="Select all visible notices"
                          disabled={visible.length === 0}
                          checked={
                            (visible.length > 0 &&
                              visibleSelected.length === visible.length) ||
                            (visibleSelected.length > 0 && 'indeterminate')
                          }
                          onCheckedChange={(checked) => {
                            onChange((current) => {
                              const next = new Set(current.selectedIds)
                              for (const notice of visible) {
                                if (checked === true) {
                                  next.add(notice.id)
                                } else {
                                  next.delete(notice.id)
                                }
                              }
                              return { ...current, selectedIds: [...next] }
                            })
                          }}
                        />
                      </TableHead>
                      {columns.map((column) => (
                        <TableHead
                          key={column.title}
                          className={`${column.className} px-1`}
                        >
                          <div className="text-body2_m_14 text-color-neutral-60 bg-color-neutral-99 flex h-[39px] items-center justify-center rounded-full">
                            {column.title}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visible.map((notice) => (
                      <TableRow
                        key={notice.id}
                        data-state={
                          selected.has(notice.id) ? 'selected' : undefined
                        }
                      >
                        <TableCell>
                          <Checkbox
                            aria-label={`Select ${notice.title}`}
                            checked={selected.has(notice.id)}
                            onCheckedChange={(checked) => {
                              onChange((current) => ({
                                ...current,
                                selectedIds:
                                  checked === true
                                    ? [
                                        ...new Set([
                                          ...current.selectedIds,
                                          notice.id
                                        ])
                                      ]
                                    : current.selectedIds.filter(
                                        (id) => id !== notice.id
                                      )
                              }))
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {(location.page - 1) * location.take +
                            data.items.findIndex(
                              (item) => item.id === notice.id
                            ) +
                            1}
                        </TableCell>
                        <TableCell className="break-words">
                          {notice.title}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {notice.createdAt === null
                            ? 'Unavailable'
                            : dateFormatter(notice.createdAt, 'YYYY-MM-DD')}
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            aria-label={`Edit ${notice.title}`}
                            className="border-color-neutral-90 bg-color-neutral-99 w-13 flex h-10 items-center justify-center rounded-full border"
                            onClick={(event) =>
                              openEditor(notice.id, event.currentTarget)
                            }
                          >
                            <PenIcon
                              aria-hidden="true"
                              className="text-color-neutral-70 size-5"
                            />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {visible.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          {data.items.length === 0
                            ? 'No notices on this page.'
                            : "No notices match this page's search."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-10">
                <BlueprintListPagination
                  kind="notices"
                  page={location.page}
                  pageSize={location.take}
                  selectedCount={selectedNotices.length}
                  currentPageCount={data.items.length}
                  hasPrevious={hasPrevious}
                  hasNext={hasNext}
                  onPrevious={() => {
                    if (hasPrevious && data.previousCursor !== undefined) {
                      router.push(
                        blueprintListHref(blueprintId, 'notice', {
                          ...location,
                          cursor: data.previousCursor,
                          page: Math.max(1, location.page - 1)
                        })
                      )
                    }
                  }}
                  onNext={() => {
                    if (hasNext && data.nextCursor !== null) {
                      router.push(
                        blueprintListHref(blueprintId, 'notice', {
                          ...location,
                          cursor: data.nextCursor,
                          page: location.page + 1
                        })
                      )
                    }
                  }}
                  onPageSizeChange={(take) => {
                    router.push(
                      blueprintListHref(blueprintId, 'notice', {
                        cursor: null,
                        take,
                        page: 1
                      })
                    )
                  }}
                />
              </div>
            </>
          )}
        </BlueprintReadBoundary>
      )}
      {editor?.scopeKey === scopeKey && (
        <BlueprintNoticeEditor
          blueprintId={blueprintId}
          noticeId={editor.noticeId}
          open
          onOpenChange={(open) => {
            if (!open) {
              const trigger = editorTrigger.current
              setEditor(null)
              queueMicrotask(() => {
                if (trigger?.isConnected) {
                  trigger.focus()
                }
              })
            }
          }}
        />
      )}
      {deleting?.scopeKey === scopeKey && (
        <BlueprintNoticeDeleteDialog
          targets={deleting.targets}
          onClose={() => setDeleting(null)}
        />
      )}
    </section>
  )
}
