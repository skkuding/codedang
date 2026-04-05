'use client'

import { CreateNoticeModal } from '@/app/admin/course/[courseId]/notice/_components/CreateNoticeModal'
import { DeleteNoticeModal } from '@/app/admin/course/[courseId]/notice/_components/DeleteNoticeModal'
import { DELETE_COURSE_NOTICE } from '@/graphql/course/mutation'
import { cn, safeFetcherWithAuth } from '@/libs/utils'
import type {
  CourseNoticeDetailResponse,
  CourseNoticeListItem
} from '@/types/type'
import { useMutation } from '@apollo/client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

interface NoticeTableProps {
  groupId: string
}

interface CourseNoticeListResponse {
  data: CourseNoticeListItem[]
  total: number
}

const PAGE_SIZE = 10

export function NoticeTableFallback() {
  return (
    <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 text-sm text-[#6B7280]">
      Loading notices...
    </div>
  )
}

const getNoticeTime = (notice: CourseNoticeListItem) =>
  new Date(notice.createTime ?? notice.updateTime ?? 0).getTime()

export function NoticeTable({ groupId }: NoticeTableProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [currentPage, setCurrentPage] = useState(1)
  const [editingNotice, setEditingNotice] = useState<{
    id: number
    title: string
    content: string
    isFixed?: boolean
    isPublic?: boolean
  } | null>(null)
  const [deletingNoticeId, setDeletingNoticeId] = useState<number | null>(null)
  const [loadingEditId, setLoadingEditId] = useState<number | null>(null)

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

  const sortedNotices = useMemo(() => {
    return [...notices].sort((a, b) => {
      if (a.isFixed !== b.isFixed) {
        return a.isFixed ? -1 : 1
      }
      return getNoticeTime(b) - getNoticeTime(a)
    })
  }, [notices])

  const totalPages = Math.max(1, Math.ceil(sortedNotices.length / PAGE_SIZE))

  const paginatedNotices = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE
    return sortedNotices.slice(startIndex, startIndex + PAGE_SIZE)
  }, [currentPage, sortedNotices])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

  const handleEditClick = async (notice: CourseNoticeListItem) => {
    setLoadingEditId(notice.id)
    try {
      const detail = await safeFetcherWithAuth
        .get(`course/notice/${notice.id}`)
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

  const handleDelete = async (courseNoticeId: number) => {
    try {
      await deleteCourseNotice({ variables: { courseNoticeId } })
      toast.success('Notice deleted!')
      await queryClient.invalidateQueries({
        queryKey: ['adminCourseNotices', Number(groupId)]
      })
      router.refresh()
    } catch {
      toast.error('Failed to delete notice.')
    }
  }

  if (isLoading) {
    return <NoticeTableFallback />
  }

  return (
    <>
      <div className="w-full">
        <div className="overflow-x-auto">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[88px_minmax(0,1fr)_96px_96px_88px] gap-2">
              {['No', 'Title', 'Edit', 'Delete', 'Pin'].map((label) => (
                <div
                  key={label}
                  className="flex h-[32px] items-center justify-center rounded-full bg-[#F3F4F6] text-sm font-medium text-[#9CA3AF]"
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="mt-3">
              {paginatedNotices.length > 0 ? (
                paginatedNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="grid grid-cols-[88px_minmax(0,1fr)_96px_96px_88px] items-center gap-2 border-b border-[#E5E7EB] py-3"
                  >
                    <div className="px-4 text-sm text-[#52525B]">
                      {notice.id}
                    </div>

                    <div className="min-w-0 px-2">
                      <div className="truncate text-sm text-[#18181B]">
                        {notice.title}
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <button
                        type="button"
                        aria-label={`Edit ${notice.title}`}
                        disabled={loadingEditId === notice.id}
                        onClick={() => handleEditClick(notice)}
                        className="flex h-[36px] w-[40px] items-center justify-center rounded-full border border-[#D4D4D8] bg-[#F5F5F5] transition hover:bg-[#EBEBEB] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Pencil className="h-4 w-4 text-[#A1A1AA]" />
                      </button>
                    </div>

                    <div className="flex justify-center">
                      <button
                        type="button"
                        aria-label={`Delete ${notice.title}`}
                        disabled={isDeleting}
                        onClick={() => setDeletingNoticeId(notice.id)}
                        className="flex h-[36px] w-[40px] items-center justify-center rounded-full border border-[#D4D4D8] bg-[#F5F5F5] transition hover:bg-[#EBEBEB] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4 text-[#A1A1AA]" />
                      </button>
                    </div>

                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={notice.isFixed}
                        readOnly
                        className="h-4 w-4 rounded border border-[#D4D4D8]"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-[160px] items-center justify-center text-sm text-[#9CA3AF]">
                  No notices found.
                </div>
              )}
            </div>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full',
                currentPage === 1
                  ? 'bg-[#E5E7EB] text-[#A1A1AA]'
                  : 'bg-[#3B82F6] text-white'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-6">
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'text-sm',
                    currentPage === page
                      ? 'font-semibold text-[#2563EB]'
                      : 'text-[#71717A]'
                  )}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full',
                currentPage === totalPages
                  ? 'bg-[#E5E7EB] text-[#A1A1AA]'
                  : 'bg-[#3B82F6] text-white'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

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
