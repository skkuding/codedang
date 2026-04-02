'use client'

import { DataTableRoot } from '@/app/admin/_components/table'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { CLONE_COURSE_NOTICES } from '@/graphql/course/mutation'
import { safeFetcherWithAuth } from '@/libs/utils'
import plusIcon from '@/public/icons/plus-line.svg'
import { useMutation } from '@apollo/client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ImportNoticeTableContent } from './ImportNoticeTableContent'
import {
  importNoticeColumns,
  type NoticeItem
} from './importNoticeTableColumns'

interface ImportNoticeModalProps {
  courseId: string
}

interface CourseNoticeListApiItem {
  id: number
  title: string
  createTime?: string
  updateTime?: string
  createdBy: string | null
  isRead: boolean
  isFixed: boolean
}

interface CourseNoticeListResponse {
  data: CourseNoticeListApiItem[]
  total: number
}

const getOrderParam = (order: string) =>
  order === 'oldest' ? 'createTime-asc' : 'createTime-desc'

export function ImportNoticeModal({ courseId }: ImportNoticeModalProps) {
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)
  const [order, setOrder] = useState('latest')
  const [sourceCourseId, setSourceCourseId] = useState('')

  const [cloneCourseNotices, { loading: isCloning }] =
    useMutation(CLONE_COURSE_NOTICES)

  const { data: noticeItems = [], isLoading } = useQuery({
    queryKey: ['importableCourseNotices', sourceCourseId, order],
    queryFn: async () => {
      const sourceId = Number(sourceCourseId)
      if (!Number.isFinite(sourceId)) {
        return []
      }

      const params = {
        take: '100',
        readFilter: 'all',
        order: getOrderParam(order)
      }

      const [fixedRes, normalRes] = await Promise.all([
        safeFetcherWithAuth
          .get(`course/${sourceId}/notice/all`, {
            searchParams: { ...params, fixed: 'true' }
          })
          .json<CourseNoticeListResponse>(),
        safeFetcherWithAuth
          .get(`course/${sourceId}/notice/all`, {
            searchParams: { ...params, fixed: 'false' }
          })
          .json<CourseNoticeListResponse>()
      ])

      return [...fixedRes.data, ...normalRes.data].map<NoticeItem>((n) => ({
        id: n.id,
        title: n.title,
        date: n.createTime ?? n.updateTime ?? '',
        course: sourceCourseId,
        creator: n.createdBy ?? 'Unknown'
      }))
    },
    enabled: open && Boolean(sourceCourseId.trim())
  })

  const sortedItems = useMemo(() => {
    return [...noticeItems].sort((a, b) => {
      const aTime = new Date(a.date || 0).getTime()
      const bTime = new Date(b.date || 0).getTime()
      return order === 'oldest' ? aTime - bTime : bTime - aTime
    })
  }, [noticeItems, order])

  const handleImportSelected = async (selectedIds: number[]) => {
    try {
      await cloneCourseNotices({
        variables: {
          courseNoticeIds: selectedIds,
          cloneToId: Number(courseId)
        }
      })

      toast.success('Notice imported!')

      await queryClient.invalidateQueries({
        queryKey: ['adminCourseNotices', Number(courseId)]
      })

      setOpen(false)
      setSourceCourseId('')
    } catch {
      toast.error('Failed to import notices.')
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="border-primary text-primary hover:bg-primary/10 h-[46px] w-[123px] rounded-full border px-6 pb-[11px] pt-[10px]"
        onClick={() => setOpen(true)}
      >
        <span className="text-sub2_m_18 flex items-center gap-[6px]">
          <Image src={plusIcon} alt="Import" />
          Import
        </span>
      </Button>

      <Modal
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setSourceCourseId('')
            setOpen(false)
            return
          }

          setOpen(true)
        }}
        size="lg"
        type="custom"
        title="Import Notice"
        className="h-auto! w-[800px]!"
      >
        <div className="pt-4">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-400">
              Loading...
            </div>
          ) : (
            <DataTableRoot
              data={sortedItems}
              columns={importNoticeColumns}
              defaultPageSize={6}
            >
              <ImportNoticeTableContent
                order={order}
                onOrderChange={setOrder}
                onImportSelected={handleImportSelected}
                isImporting={isCloning}
              />
            </DataTableRoot>
          )}
        </div>
      </Modal>
    </>
  )
}
