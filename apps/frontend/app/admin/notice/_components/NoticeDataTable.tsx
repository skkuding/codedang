'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { GET_NOTICES } from '@/graphql/notice/queries'
import { useApolloClient, useSuspenseQuery } from '@apollo/client'
import { useMemo, useState } from 'react'
import { DeleteNoticeButton } from './DeleteNoticeButton'
import { columns } from './NoticeColumns'

export function NoticeDataTable() {
  const client = useApolloClient()

  const { data } = useSuspenseQuery(GET_NOTICES, { variables: { take: 10 } })
  const notices = useMemo(
    () =>
      data.getNotices.map((notice) => ({
        id: Number(notice?.id),
        title: notice?.title ?? '-',
        isVisible: notice?.isVisible ?? true,
        isFixed: notice?.isFixed ?? false,
        creteTime: notice?.createTime,
        updateTime: notice?.updateTime
      })),
    [data.getNotices]
  )

  const onSuccess = () => {
    client.refetchQueries({
      include: [GET_NOTICES]
    })
  }

  const bodyStyle = {
    title: 'justify-start'
  }

  return (
    <div>
      <DataTableRoot data={notices} columns={columns}>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <DataTableSearchBar columndId="title" className="rounded-full" />
          </div>
          <div className="flex gap-2">
            <DeleteNoticeButton onSuccess={onSuccess} />
          </div>
        </div>
        <DataTable
          bodyStyle={bodyStyle}
          getHref={(data) => `/admin/notice/${data.id}`}
        />
        <DataTablePagination showSelection />
      </DataTableRoot>
    </div>
  )
}

export function NoticeDataTableFallback() {
  return <DataTableFallback withSearchBar={false} columns={columns} />
}
