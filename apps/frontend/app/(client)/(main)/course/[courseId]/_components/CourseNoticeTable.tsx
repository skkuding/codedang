'use client'

import {
  DataTable,
  DataTablePagination,
  DataTableRoot
} from '@/app/admin/_components/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import { cn, safeFetcherWithAuth } from '@/libs/utils'
import arrowDownIcon from '@/public/icons/arrow-down.svg'
import type {
  CourseNoticeListItem,
  CourseNoticeListResponse
} from '@/types/type'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import {
  courseNoticeColumns,
  type CourseNoticeRow
} from './CourseNoticeColumns'

type FilterType = 'all' | 'unread'
type OrderType = 'latest' | 'oldest'

interface CourseNoticeTableProps {
  courseId: number
}

const getTime = (notice: CourseNoticeListItem) =>
  new Date(notice.createTime ?? notice.updateTime ?? 0).getTime()

export function CourseNoticeTable({ courseId }: CourseNoticeTableProps) {
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [orderType, setOrderType] = useState<OrderType | undefined>()

  let orderLabel = 'Order'

  if (orderType === 'latest') {
    orderLabel = 'Latest'
  } else if (orderType === 'oldest') {
    orderLabel = 'Oldest'
  }

  const { data: notices = [] } = useQuery<CourseNoticeListItem[]>({
    queryKey: ['courseNotices', courseId],
    queryFn: async () => {
      const [fixedRes, normalRes] = await Promise.all([
        safeFetcherWithAuth
          .get(`course/${courseId}/notice/all`, {
            searchParams: {
              take: '100',
              fixed: 'true',
              readFilter: 'all',
              order: 'createTime-desc'
            }
          })
          .json<CourseNoticeListResponse>(),
        safeFetcherWithAuth
          .get(`course/${courseId}/notice/all`, {
            searchParams: {
              take: '100',
              fixed: 'false',
              readFilter: 'all',
              order: 'createTime-desc'
            }
          })
          .json<CourseNoticeListResponse>()
      ])
      return [...fixedRes.data, ...normalRes.data]
    },
    enabled: Boolean(courseId)
  })

  const tableData: CourseNoticeRow[] = useMemo(() => {
    const filtered =
      filterType === 'unread' ? notices.filter((n) => !n.isRead) : notices
    // Build noMap from chronological order
    const noMap = new Map(
      [...filtered]
        .sort((a, b) => getTime(a) - getTime(b))
        .map((n, i) => [n.id, i + 1])
    )

    // Sort once for display order
    return [...filtered]
      .sort((a, b) => {
        if (a.isFixed !== b.isFixed) {
          return a.isFixed ? -1 : 1
        }
        return orderType === 'oldest'
          ? getTime(a) - getTime(b)
          : getTime(b) - getTime(a)
      })
      .map((n) => ({
        id: n.id,
        no: String(noMap.get(n.id) ?? 0).padStart(2, '0'),
        title: n.title,
        createdBy: n.createdBy ?? 'Unknown',
        date: n.createTime ?? n.updateTime ?? '',
        isRead: n.isRead,
        isFixed: n.isFixed
      }))
  }, [notices, filterType, orderType])

  return (
    <DataTableRoot
      data={tableData}
      columns={courseNoticeColumns}
      defaultPageSize={10}
      defaultSortState={[]}
    >
      <div className="mb-6 flex items-center justify-between">
        <span className="text-2xl font-semibold leading-[33.6px] tracking-[-0.48px]">
          NOTICE
        </span>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-[46px] min-w-[108px] items-center justify-center gap-2 rounded-full border bg-white text-sm leading-[22.4px] text-neutral-500 outline-none"
              >
                <span>{orderLabel}</span>
                <Image
                  src={arrowDownIcon}
                  alt="arrow down"
                  className="h-4 w-4"
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="border-neutral-95 min-w-[108px] rounded-[16px] border bg-white p-1"
            >
              <DropdownMenuItem
                onClick={() => setOrderType('latest')}
                className="cursor-pointer rounded-[10px] text-sm leading-[22.4px] text-neutral-500"
              >
                Latest
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setOrderType('oldest')}
                className="cursor-pointer rounded-[10px] text-sm leading-[22.4px] text-neutral-500"
              >
                Oldest
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex h-[46px] items-center rounded-full border p-[5px]">
            {(['all', 'unread'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={cn(
                  'text-body1_m_16 h-9 rounded-full px-8 py-[6px]',
                  filterType === type
                    ? 'bg-primary text-white'
                    : 'text-[#808080]'
                )}
              >
                {type === 'all' ? 'All' : 'Unread'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <DataTable
        size="md"
        headerStyle={{
          no: 'w-[80px]',
          title: '',
          date: 'w-[180px]',
          createdBy: 'w-[110px]'
        }}
        bodyStyle={{
          no: 'text-center',
          title: 'justify-start',
          date: 'text-center',
          createdBy: 'text-center'
        }}
        getHref={(row) => `/course/${courseId}/notice/${row.id}`}
      />

      <div className="mt-10">
        <DataTablePagination showRowsPerPage={false} />
      </div>
    </DataTableRoot>
  )
}
