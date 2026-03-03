'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot
} from '@/app/admin/_components/table'
import { getNotices, saveNotices } from '@/libs/noticeStore'
import { useCallback, useEffect, useState } from 'react'
import { getColumns, type DataTableNotice } from './NoticeTableColumns'

interface NoticeTableProps {
  groupId: string
}

export function NoticeTable({ groupId }: NoticeTableProps) {
  const columns = getColumns(groupId)
  const [notices, setNotices] = useState<DataTableNotice[]>([])

  useEffect(() => {
    setNotices(getNotices())
  }, [])

  const handleNoticeEvent = useCallback(
    (e: Event) => {
      const { detail } = e as CustomEvent
      let updated = [...notices]

      if (detail.type === 'edit') {
        updated = updated.map((n) =>
          n.id === detail.id
            ? {
                ...n,
                title: detail.title,
                content: detail.content,
                updateTime: new Date().toISOString()
              }
            : n
        )
      } else if (detail.type === 'delete') {
        updated = updated.filter((n) => n.id !== detail.id)
      } else if (detail.type === 'pin') {
        updated = updated.map((n) =>
          n.id === detail.id ? { ...n, isFixed: !n.isFixed } : n
        )
      } else if (detail.type === 'create') {
        const newId = Math.max(...updated.map((n) => n.id), 0) + 1
        const now = new Date().toISOString()
        updated = [
          {
            id: newId,
            title: detail.title,
            content: detail.content,
            updateTime: now,
            createTime: now,
            isFixed: false,
            isPublic: true,
            createdBy: detail.createdBy || 'Admin',
            isRead: false
          },
          ...updated
        ]
      }

      setNotices(updated)
      saveNotices(updated)
    },
    [notices]
  )

  useEffect(() => {
    window.addEventListener('noticeUpdated', handleNoticeEvent)
    return () => window.removeEventListener('noticeUpdated', handleNoticeEvent)
  }, [handleNoticeEvent])

  return (
    <DataTableRoot
      data={[...notices].sort((a, b) => b.id - a.id)}
      columns={columns}
    >
      <DataTable
        headerStyle={{
          edit: 'w-[80px]',
          delete: 'w-[80px]',
          pin: 'w-[80px]'
        }}
        bodyStyle={{
          title: 'justify-start',
          edit: 'w-[80px]',
          delete: 'w-[80px]',
          pin: 'w-[80px]'
        }}
      />
      <DataTablePagination showRowsPerPage={false} />
    </DataTableRoot>
  )
}

export function NoticeTableFallback() {
  return <DataTableFallback columns={getColumns('')} />
}
