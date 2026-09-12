'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { CreateNoticeModal } from '@/app/admin/course/[courseId]/(overview)/notice/_components/CreateNoticeModal'
import { DeleteNoticeModal } from '@/app/admin/course/[courseId]/(overview)/notice/_components/DeleteNoticeModal'
import { ImportNoticeModal } from '@/app/admin/course/[courseId]/(overview)/notice/_components/ImportNoticeModal'
import {
  DELETE_COURSE_NOTICE,
  UPDATE_COURSE_NOTICE
} from '@/graphql/course/mutation'
import { safeFetcherWithAuth } from '@/libs/utils'
import type {
  CourseNoticeDetailResponse,
  CourseNoticeListItem
} from '@/types/type'
import { useMutation } from '@apollo/client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { getNoticeColumns, type DataTableNotice } from './NoticeTableColumns'

interface NoticeTableProps {
  groupId: string
}

interface CourseNoticeListResponse {
  data: CourseNoticeListItem[]
  total: number
}

export function NoticeTableFallback() {
  return (
    <DataTableFallback
      columns={getNoticeColumns({
        onEdit: () => {},
        onDeleteRequest: () => {},
        onTogglePin: () => {},
        loadingEditId: null,
        togglingPinId: null,
        isDeleting: false
      })}
    />
  )
}

export function NoticeTable({ groupId }: NoticeTableProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [editingNotice, setEditingNotice] = useState<{
    id: number
    title: string
    content: string
    isFixed?: boolean
    isPublic?: boolean
  } | null>(null)
  const [deletingNoticeId, setDeletingNoticeId] = useState<number | null>(null)
  const [loadingEditId, setLoadingEditId] = useState<number | null>(null)
  const [togglingPinId, setTogglingPinId] = useState<number | null>(null)

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ['adminCourseNotices', Number(groupId)],
    queryFn: async () => {
      const [fixedResponse, normalResponse] = await Promise.all([
        safeFetcherWithAuth
          .get(`course/${groupId}/notice/all`, {
            searchParams: {
              take: '100',
              fixed: 'true',
              readFilter: 'all',
              order: 'createTime-desc'
            }
          })
          .json<CourseNoticeListResponse>(),
        safeFetcherWithAuth
          .get(`course/${groupId}/notice/all`, {
            searchParams: {
              take: '100',
              fixed: 'false',
              readFilter: 'all',
              order: 'createTime-desc'
            }
          })
          .json<CourseNoticeListResponse>()
      ])
      return [...fixedResponse.data, ...normalResponse.data]
    }
  })

  const [deleteCourseNotice, { loading: isDeleting }] =
    useMutation(DELETE_COURSE_NOTICE)
  const [updateCourseNotice] = useMutation(UPDATE_COURSE_NOTICE)

  const tableData: DataTableNotice[] = useMemo(() => {
    const noticeNumberMap = new Map(
      [...notices]
        .sort((a, b) => a.id - b.id)
        .map((notice, index) => [notice.id, index + 1])
    )

    return [...notices]
      .sort((a, b) => b.id - a.id)
      .map((notice) => ({
        ...notice,
        no: noticeNumberMap.get(notice.id) ?? 0
      }))
  }, [notices])

  const handleEditClick = async (notice: DataTableNotice) => {
    setLoadingEditId(notice.id)
    try {
      const detail = await safeFetcherWithAuth
        .get(`course/${groupId}/notice/${notice.id}`)
        .json<CourseNoticeDetailResponse>()
      setEditingNotice({
        id: notice.id,
        title: detail.current.title,
        content: detail.current.content,
        isFixed: notice.isFixed,
        isPublic: detail.current.isPublic
      })
    } catch {
      toast.error('Failed to load notice.')
    } finally {
      setLoadingEditId(null)
    }
  }

  const handleTogglePin = async (notice: DataTableNotice) => {
    setTogglingPinId(notice.id)
    try {
      await updateCourseNotice({
        variables: {
          groupId: Number(groupId),
          courseNoticeId: notice.id,
          input: { isFixed: !notice.isFixed }
        }
      })
      await queryClient.invalidateQueries({
        queryKey: ['adminCourseNotices', Number(groupId)]
      })
    } catch {
      toast.error('Failed to update pin status.')
    } finally {
      setTogglingPinId(null)
    }
  }

  const handleDelete = async (courseNoticeId: number) => {
    try {
      await deleteCourseNotice({
        variables: { groupId: Number(groupId), courseNoticeId }
      })
      toast.success('Notice deleted!')
      await queryClient.invalidateQueries({
        queryKey: ['adminCourseNotices', Number(groupId)]
      })
      router.refresh()
    } catch {
      toast.error('Failed to delete notice.')
    }
  }

  const columns = useMemo(
    () =>
      getNoticeColumns({
        onEdit: handleEditClick,
        onDeleteRequest: setDeletingNoticeId,
        onTogglePin: handleTogglePin,
        loadingEditId,
        togglingPinId,
        isDeleting
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadingEditId, togglingPinId, isDeleting, groupId]
  )

  if (isLoading) {
    return <NoticeTableFallback />
  }

  return (
    <>
      <DataTableRoot data={tableData} columns={columns} defaultPageSize={10}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <DataTableSearchBar columndId="title" sizeVariant="md" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ImportNoticeModal courseId={groupId} />
            <CreateNoticeModal courseId={groupId} />
          </div>
        </div>
        <DataTable
          headerStyle={{
            no: 'w-16',
            updateTime: 'w-[84px]',
            edit: 'w-[84px]',
            delete: 'w-[84px]',
            pin: 'w-[84px]'
          }}
          bodyStyle={{
            title: 'justify-start',
            no: 'w-16',
            updateTime: 'w-[84px]',
            edit: 'w-[84px]',
            delete: 'w-[84px]',
            pin: 'w-[84px]'
          }}
        />
        <div className="mt-6">
          <DataTablePagination />
        </div>
      </DataTableRoot>

      <CreateNoticeModal
        courseId={groupId}
        editData={editingNotice}
        open={Boolean(editingNotice)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setEditingNotice(null)
          }
        }}
      />

      <DeleteNoticeModal
        open={deletingNoticeId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingNoticeId(null)
          }
        }}
        isDeleting={isDeleting}
        onDelete={async () => {
          if (deletingNoticeId === null) {
            return
          }
          await handleDelete(deletingNoticeId)
          setDeletingNoticeId(null)
        }}
      />
    </>
  )
}
