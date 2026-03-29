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
import { cn } from '@/libs/utils'
import arrowDownIcon from '@/public/icons/arrow-down.svg'
import type { CourseNoticeListItem } from '@/types/type'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { mockCourseNotices } from '../notice/_components/mock'
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
    queryKey: ['courseNotices', courseId, filterType, orderType],
    queryFn: () => mockCourseNotices,
    enabled: Boolean(courseId),
    retry: false
  })

  const tableData: CourseNoticeRow[] = useMemo(() => {
    const filteredNotices =
      filterType === 'unread'
        ? notices.filter((notice) => !notice.isRead)
        : notices

    const noMap = new Map(
      [...filteredNotices]
        .sort((a, b) => getTime(a) - getTime(b))
        .map((notice, index) => [notice.id, index + 1])
    )

    return [...filteredNotices]
      .sort((a, b) => {
        if (a.isFixed !== b.isFixed) {
          return a.isFixed ? -1 : 1
        }
        return orderType === 'oldest'
          ? getTime(a) - getTime(b)
          : getTime(b) - getTime(a)
      })
      .map((notice) => ({
        id: notice.id,
        no: String(noMap.get(notice.id) ?? 0).padStart(2, '0'),
        title: notice.title,
        createdBy: notice.createdBy ?? 'Unknown',
        date: notice.createTime ?? notice.updateTime ?? '',
        isRead: notice.isRead,
        isFixed: notice.isFixed
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
