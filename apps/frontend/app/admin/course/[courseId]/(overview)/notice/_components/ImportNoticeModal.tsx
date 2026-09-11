'use client'

import { DataTableRoot } from '@/app/admin/_components/table'
import { Button } from '@/components/shadcn/button'
import { CLONE_COURSE_NOTICES } from '@/graphql/course/mutation'
import { GET_COURSES_USER_LEAD } from '@/graphql/course/queries'
import { safeFetcherWithAuth } from '@/libs/utils'
import type { CourseNoticeListResponse } from '@/types/type'
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

export function ImportNoticeModal({ courseId }: ImportNoticeModalProps) {
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)

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

  const importableCourseIds = importableCourses.map((course) => course.id)

  const { data: noticeItems = [], isLoading } = useQuery({
    queryKey: ['importableCourseNotices', importableCourseIds],
    queryFn: async () => {
      const params = {
        take: '100',
        readFilter: 'all',
        order: 'createTime-desc'
      }

      const coursesNotices = await Promise.all(
        importableCourses.map(async (course) => {
          const sourceId = Number(course.id)

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
            course: course.groupName,
            creator: n.createdBy ?? 'Unknown'
          }))
        })
      )

      return coursesNotices.flat()
    },
    enabled: open && importableCourses.length > 0
  })

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
          <HiMiniPlusCircle className="size-5" />
          Import
        </span>
      </Button>

      <NoticeModal
        open={open}
        onOpenChange={setOpen}
        className="flex max-h-[85vh] flex-col overflow-hidden"
      >
        <DataTableRoot
          data={noticeItems}
          columns={importNoticeColumns}
          defaultPageSize={6}
          defaultSortState={[{ id: 'date', desc: true }]}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex min-h-0 flex-1 flex-col gap-3 px-10 pb-[50px] pt-10">
            <ImportNoticeTableContent
              onImportSelected={handleImportSelected}
              isImporting={isCloning}
              isLoadingNotices={isLoading}
            />
          </div>
        </DataTableRoot>
      </NoticeModal>
    </>
  )
}
