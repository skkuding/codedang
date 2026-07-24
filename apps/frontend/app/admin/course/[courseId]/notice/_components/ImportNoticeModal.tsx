'use client'

import { DataTableRoot } from '@/app/admin/_components/table'
import { Button } from '@/components/shadcn/button'
import { CLONE_COURSE_NOTICES } from '@/graphql/course/mutation'
import { GET_COURSES_USER_LEAD } from '@/graphql/course/queries'
import { safeFetcherWithAuth } from '@/libs/utils'
import { useMutation, useQuery as useApolloQuery } from '@apollo/client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { HiMiniPlusCircle } from 'react-icons/hi2'
import { toast } from 'sonner'
import { ImportNoticeTableContent } from './ImportNoticeTableContent'
import { NoticeModal } from './NoticeModal'
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

  const { data: coursesData } = useApolloQuery(GET_COURSES_USER_LEAD, {
    skip: !open
  })

  const importableCourses = useMemo(
    () =>
      (coursesData?.getCoursesUserLead ?? []).filter(
        (course) => Number(course.id) !== Number(courseId)
      ),
    [coursesData, courseId]
  )

  const sourceCourseName = useMemo(
    () =>
      importableCourses.find((course) => String(course.id) === sourceCourseId)
        ?.groupName ?? '',
    [importableCourses, sourceCourseId]
  )

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
        course: sourceCourseName,
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
          groupId: Number(courseId)
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
          <HiMiniPlusCircle className="h-5 w-5" />
          Import
        </span>
      </Button>

      <NoticeModal
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setSourceCourseId('')
            setOpen(false)
            return
          }

          setOpen(true)
        }}
        className="max-h-[85vh]"
      >
        <DataTableRoot
          data={sortedItems}
          columns={importNoticeColumns}
          defaultPageSize={6}
        >
          <div className="flex flex-col gap-2 pb-[50px] pt-10">
            <div className="flex flex-col gap-3 px-10 py-2">
              <ImportNoticeTableContent
                order={order}
                onOrderChange={setOrder}
                onImportSelected={handleImportSelected}
                isImporting={isCloning}
                importableCourses={importableCourses}
                sourceCourseId={sourceCourseId}
                onSourceCourseIdChange={setSourceCourseId}
                isLoadingNotices={isLoading}
              />
            </div>
          </div>
        </DataTableRoot>
      </NoticeModal>
    </>
  )
}
