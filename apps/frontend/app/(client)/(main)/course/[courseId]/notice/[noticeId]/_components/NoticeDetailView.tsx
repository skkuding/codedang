'use client'

import { profileQueries } from '@/app/(client)/_libs/queries/profile'
import { safeFetcherWithAuth, dateFormatter } from '@/libs/utils'
import type {
  CourseNoticeCommentGroup,
  CourseNoticeDetailResponse
} from '@/types/type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { FaUser } from 'react-icons/fa6'
import { IoTime } from 'react-icons/io5'
import { toast } from 'sonner'
import { NoticeCommentsSection } from './NoticeCommentsSection'

export function NoticeDetailView() {
  const { courseId, noticeId } = useParams()
  const currentId = Number(noticeId)
  const queryClient = useQueryClient()

  const [commentContent, setCommentContent] = useState('')
  const [commentSecret, setCommentSecret] = useState(false)

  const [replyTargetId, setReplyTargetId] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replySecret, setReplySecret] = useState(false)

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [editingSecret, setEditingSecret] = useState(false)

  const { data: profile } = useQuery({
    ...profileQueries.fetch(),
    initialData: {
      username: '',
      userProfile: {
        realName: ''
      },
      studentId: '',
      college: '',
      major: '',
      email: ''
    },
    retry: false
  })

  const {
    data: noticeData,
    isLoading: isNoticeLoading,
    isError: isNoticeError
  } = useQuery({
    queryKey: ['courseNoticeDetail', currentId],
    queryFn: () =>
      safeFetcherWithAuth
        .get(`course/notice/${currentId}`)
        .json<CourseNoticeDetailResponse>(),
    enabled: Number.isFinite(currentId)
  })

  const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
    queryKey: ['courseNoticeComments', currentId],
    queryFn: () =>
      safeFetcherWithAuth
        .get(`course/notice/${currentId}/comment`, {
          searchParams: {
            take: '100'
          }
        })
        .json<CourseNoticeCommentGroup[]>(),
    enabled: Number.isFinite(currentId)
  })

  const invalidateNotice = () => {
    queryClient.invalidateQueries({
      queryKey: ['courseNoticeDetail', currentId]
    })
    queryClient.invalidateQueries({
      queryKey: ['courseNoticeComments', currentId]
    })
    queryClient.invalidateQueries({
      queryKey: ['courseNotices', courseId]
    })
  }

  const { mutate: createComment, isPending: isCreatingComment } = useMutation({
    mutationFn: (payload: {
      content: string
      isSecret: boolean
      replyOnId?: number
    }) =>
      safeFetcherWithAuth
        .post(`course/notice/${currentId}/comment`, {
          json: payload
        })
        .json(),
    onSuccess: () => {
      toast.success('Comment posted!')
      setCommentContent('')
      setCommentSecret(false)
      setReplyTargetId(null)
      setReplyContent('')
      setReplySecret(false)
      invalidateNotice()
    },
    onError: () => {
      toast.error('Failed to post comment.')
    }
  })

  const { mutate: updateComment, isPending: isUpdatingComment } = useMutation({
    mutationFn: (payload: {
      commentId: number
      content: string
      isSecret: boolean
    }) =>
      safeFetcherWithAuth
        .patch(`course/notice/${currentId}/comment/${payload.commentId}`, {
          json: {
            content: payload.content,
            isSecret: payload.isSecret
          }
        })
        .json(),
    onSuccess: () => {
      toast.success('Comment updated!')
      setEditingCommentId(null)
      setEditingContent('')
      setEditingSecret(false)
      invalidateNotice()
    },
    onError: () => {
      toast.error('Failed to update comment.')
    }
  })

  const { mutate: deleteComment } = useMutation({
    mutationFn: (commentId: number) =>
      safeFetcherWithAuth.delete(
        `course/notice/${currentId}/comment/${commentId}`
      ),
    onSuccess: () => {
      toast.success('Comment deleted!')
      invalidateNotice()
    },
    onError: () => {
      toast.error('Failed to delete comment.')
    }
  })

  const notice = noticeData?.current
  const prevNotice = noticeData?.prev ?? null
  const nextNotice = noticeData?.next ?? null
  const basePath = `/course/${courseId}/notice`
  const commentCount = notice?._count?.CourseNoticeComment ?? 0
  const groupedComments = useMemo(() => comments, [comments])

  if (isNoticeLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        Loading...
      </div>
    )
  }

  if (isNoticeError || !notice) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        Notice not found.
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col px-4 pb-12 pt-10 lg:mt-20 lg:px-6 lg:pt-0">
      <div className="mb-5">
        <span className="inline-block rounded-full bg-[#F5F5F5] px-4 py-1.5 text-sm text-[#787E80]">
          No. {currentId}
        </span>
      </div>

      <h1 className="text-xl font-semibold leading-snug text-[#333333] lg:text-2xl">
        {notice.title}
      </h1>

      <div className="mt-4 flex flex-col gap-1.5 text-sm text-[#787E80]">
        <div className="flex items-center gap-2">
          <FaUser className="h-3.5 w-3.5 text-[#3581FA]" />
          <span>{notice.createdBy ?? 'Unknown'}</span>
        </div>
        <div className="flex items-center gap-2">
          <IoTime className="h-4 w-4 text-[#3581FA]" />
          <span>{dateFormatter(notice.createTime, 'YYYY-MM-DD HH:mm:ss')}</span>
        </div>
      </div>

      <div
        className="prose mt-8 max-w-full text-sm leading-relaxed text-gray-800 lg:text-base"
        dangerouslySetInnerHTML={{ __html: notice.content }}
      />

      <div className="mt-12 overflow-hidden rounded-lg border border-[#E5E5E5]">
        {prevNotice && (
          <Link
            href={`/course/${courseId}/notice/${prevNotice.id}`}
            className="flex items-center border-b border-[#E5E5E5] px-6 py-4 hover:bg-gray-50"
          >
            <span className="w-24 text-sm font-semibold text-gray-700">
              Previous
            </span>
            <span className="text-sm text-gray-600">{prevNotice.title}</span>
          </Link>
        )}
        {nextNotice && (
          <Link
            href={`/course/${courseId}/notice/${nextNotice.id}`}
            className="flex items-center px-6 py-4 hover:bg-gray-50"
          >
            <span className="w-24 text-sm font-semibold text-[#3581FA]">
              Next
            </span>
            <span className="text-sm text-gray-600">{nextNotice.title}</span>
          </Link>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          href={basePath}
          className="rounded-full border border-[#D9D9D9] px-5 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Back to the List
        </Link>
      </div>

      <NoticeCommentsSection
        commentCount={commentCount}
        isCommentsLoading={isCommentsLoading}
        groupedComments={groupedComments}
        profileUsername={profile?.username}
        commentContent={commentContent}
        setCommentContent={setCommentContent}
        commentSecret={commentSecret}
        setCommentSecret={setCommentSecret}
        isCreatingComment={isCreatingComment}
        onCreateComment={() =>
          createComment({
            content: commentContent,
            isSecret: commentSecret
          })
        }
        replyTargetId={replyTargetId}
        setReplyTargetId={setReplyTargetId}
        replyContent={replyContent}
        setReplyContent={setReplyContent}
        replySecret={replySecret}
        setReplySecret={setReplySecret}
        onCreateReply={(commentId) =>
          createComment({
            content: replyContent,
            isSecret: replySecret,
            replyOnId: commentId
          })
        }
        editingCommentId={editingCommentId}
        setEditingCommentId={setEditingCommentId}
        editingContent={editingContent}
        setEditingContent={setEditingContent}
        editingSecret={editingSecret}
        setEditingSecret={setEditingSecret}
        isUpdatingComment={isUpdatingComment}
        onUpdateComment={(commentId) =>
          updateComment({
            commentId,
            content: editingContent,
            isSecret: editingSecret
          })
        }
        onDeleteComment={(commentId) => deleteComment(commentId)}
      />
    </div>
  )
}
