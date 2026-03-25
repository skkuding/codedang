'use client'

import {
  PageNavigation,
  Paginator,
  SlotNavigation
} from '@/components/PaginatorV2'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { usePagination } from '@/libs/hooks/usePaginationV2'
import { cn, dateFormatter, safeFetcherWithAuth } from '@/libs/utils'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { CourseNoticeItem } from './NoticeColumns'

const ITEMS_PER_PAGE = 10

type FilterType = 'all' | 'unread'
type OrderType = 'latest' | 'oldest'

interface NoticeListProps {
  courseId: number
}

interface CourseNoticeListResponse {
  data: Array<{
    id: number
    title: string
    updateTime: string
    isFixed: boolean
    createdBy: string | null
    isRead: boolean
    commentCount: number
  }>
  total: number
}

export function NoticeList({ courseId }: NoticeListProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [order, setOrder] = useState<OrderType>('latest')
  const [isOrderOpen, setIsOrderOpen] = useState(false)
  const apiOrder = order === 'latest' ? 'createTime-desc' : 'createTime-asc'

  const {
    data: normalNoticeData,
    isLoading: isNormalLoading,
    isError: isNormalError
  } = useQuery({
    queryKey: ['courseNotices', courseId, filter, order],
    queryFn: () =>
      safeFetcherWithAuth
        .get(`course/${courseId}/notice/all`, {
          searchParams: {
            take: '100',
            fixed: 'false',
            readFilter: filter,
            order: apiOrder
          }
        })
        .json<CourseNoticeListResponse>(),
    enabled: Boolean(courseId)
  })

  const { data: fixedNoticeData, isLoading: isFixedLoading } = useQuery({
    queryKey: ['courseFixedNotices', courseId, order],
    queryFn: () =>
      safeFetcherWithAuth
        .get(`course/${courseId}/notice/all`, {
          searchParams: {
            take: '100',
            fixed: 'true',
            readFilter: 'all',
            order: apiOrder
          }
        })
        .json<CourseNoticeListResponse>(),
    enabled: Boolean(courseId)
  })

  const notices: CourseNoticeItem[] = [
    ...((fixedNoticeData?.data ?? []).map((notice) => ({
      id: notice.id,
      title: notice.title,
      createTime: notice.updateTime,
      createdBy: notice.createdBy ?? '',
      isRead: notice.isRead,
      isFixed: notice.isFixed
    })) as CourseNoticeItem[]),
    ...((normalNoticeData?.data ?? []).map((notice) => ({
      id: notice.id,
      title: notice.title,
      createTime: notice.updateTime,
      createdBy: notice.createdBy ?? '',
      isRead: notice.isRead,
      isFixed: notice.isFixed
    })) as CourseNoticeItem[])
  ]

  const creationOrder = new Map(
    [...notices]
      .sort(
        (a, b) =>
          new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
      )
      .map((n, i) => [n.id, i + 1])
  )

  const sortedData = [...notices]
    .filter((notice) => (filter === 'unread' ? !notice.isRead : true))
    .sort((a, b) => {
      if (a.isFixed !== b.isFixed) {
        return a.isFixed ? -1 : 1
      }
      return order === 'latest'
        ? new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
        : new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
    })

  const {
    paginatedItems,
    currentPage,
    firstPage,
    lastPage,
    gotoPage,
    gotoSlot,
    prevDisabled,
    nextDisabled
  } = usePagination({
    data: sortedData,
    totalCount: sortedData.length,
    pagesPerSlot: 10,
    itemsPerPage: ITEMS_PER_PAGE
  })

  const headerColumns = [
    { key: 'id', label: 'NO', className: 'w-[80px]' },
    { key: 'title', label: 'Title', className: '' },
    { key: 'createTime', label: 'Date', className: 'w-[180px]' },
    { key: 'createdBy', label: 'Writer', className: 'w-[100px]' }
  ]

  if (isNormalLoading || isFixedLoading) {
    return (
      <div className="flex flex-col">
        <div className="mt-8 text-sm text-gray-500">Loading...</div>
      </div>
    )
  }

  if (isNormalError) {
    return (
      <div className="flex flex-col">
        <div className="mt-8 text-sm text-gray-500">
          Failed to load notices.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-2xl font-semibold leading-[33.6px] tracking-[-0.48px]">
          NOTICE
        </span>
        <div className="flex items-center gap-4">
          {/* Order Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOrderOpen(!isOrderOpen)}
              className="flex h-[46px] items-center gap-2 rounded-full border border-[#D9D9D9] bg-white px-6 text-base font-normal text-[#8A8A8A]"
            >
              Order
              <svg
                className={cn(
                  'h-3.5 w-3.5 text-[#8A8A8A] transition-transform',
                  isOrderOpen && 'rotate-180'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isOrderOpen && (
              <div className="absolute right-0 z-10 mt-1 w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  onClick={() => {
                    setOrder('latest')
                    setIsOrderOpen(false)
                  }}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm',
                    order === 'latest'
                      ? 'bg-gray-100 font-medium'
                      : 'hover:bg-gray-50'
                  )}
                >
                  Latest
                </button>
                <button
                  onClick={() => {
                    setOrder('oldest')
                    setIsOrderOpen(false)
                  }}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm',
                    order === 'oldest'
                      ? 'bg-gray-100 font-medium'
                      : 'hover:bg-gray-50'
                  )}
                >
                  Oldest
                </button>
              </div>
            )}
          </div>

          {/* All / Unread Toggle */}
          <div className="flex h-[46px] items-center rounded-full border border-[#D9D9D9] bg-white p-1">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'h-[38px] rounded-full px-7 text-base font-medium transition-colors',
                filter === 'all'
                  ? 'bg-[#3581FA] text-white'
                  : 'text-[#8A8A8A] hover:bg-gray-50'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                'h-[38px] rounded-full px-6 text-base font-medium transition-colors',
                filter === 'unread'
                  ? 'bg-[#3581FA] text-white'
                  : 'text-[#8A8A8A] hover:bg-gray-50'
              )}
            >
              Unread
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-8">
        <Table>
          <TableHeader className="border-b-0">
            <TableRow>
              {headerColumns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  <div className="flex h-[39px] items-center justify-center whitespace-nowrap rounded-full bg-neutral-200/30 text-sm font-normal text-[#8A8A8A]">
                    {col.label}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="[&_td]:border-[#80808040] [&_tr:last-child_td]:border-b-0">
            {paginatedItems.length > 0 ? (
              paginatedItems.map((notice) => {
                const no = creationOrder.get(notice.id) ?? 0
                return (
                  <TableRow
                    key={notice.id}
                    className="cursor-pointer hover:bg-neutral-200/30"
                  >
                    <TableCell
                      className={cn(
                        'relative text-center text-sm text-gray-500',
                        notice.isFixed &&
                          "before:absolute before:left-0 before:top-0 before:h-full before:w-[4px] before:rounded-l-full before:bg-[#3581FA] before:content-['']"
                      )}
                    >
                      {String(no).padStart(2, '0')}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="flex items-center gap-2">
                        <span className="line-clamp-1">{notice.title}</span>
                        {!notice.isRead && (
                          <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-[#3581FA]" />
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {dateFormatter(notice.createTime, 'YY-MM-DD HH:mm')}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {notice.createdBy}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-12">
        <Paginator>
          <SlotNavigation
            direction="prev"
            gotoSlot={gotoSlot}
            disabled={prevDisabled}
          />
          <PageNavigation
            firstPage={firstPage}
            lastPage={lastPage}
            currentPage={currentPage}
            gotoPage={gotoPage}
          />
          <SlotNavigation
            direction="next"
            gotoSlot={gotoSlot}
            disabled={nextDisabled}
          />
        </Paginator>
      </div>
    </div>
  )
}
