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

  const { data: noticeData } = useQuery({
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
          searchParams: { take: '100' }
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
    queryClient.invalidateQueries({ queryKey: ['courseNotices', courseId] })
  }

  const { mutate: createComment, isPending: isCreatingComment } = useMutation({
    mutationFn: (payload: {
      content: string
      isSecret: boolean
      replyOnId?: number
    }) =>
      safeFetcherWithAuth
        .post(`course/notice/${currentId}/comment`, { json: payload })
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
    onError: () => toast.error('Failed to post comment.')
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
    onError: () => toast.error('Failed to update comment.')
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
    onError: () => toast.error('Failed to delete comment.')
  })

  const notice = noticeData?.current
  const prevNotice = noticeData?.prev ?? null
  const nextNotice = noticeData?.next ?? null
  const basePath = `/course/${courseId}/notice`
  const commentCount = notice?._count?.CourseNoticeComment ?? 0
  const groupedComments = useMemo(() => comments, [comments])

  if (!notice) {
    return null
  }

  return (
    <div className="mt-20 flex flex-col gap-6 pl-10 pr-[116px]">
      <div className="bg-color-neutral-99 text-color-neutral-60 flex w-fit items-center gap-2 rounded-full px-4 py-[6px] text-sm">
        No. {currentId}
      </div>

      <div className="flex flex-col gap-4 pb-8">
        <h1 className="text-2xl font-semibold leading-[1.4]">{notice.title}</h1>

        <div className="text-color-neutral-50 flex flex-col gap-[6px] text-[13px]">
          <div className="flex items-center gap-[10px]">
            <FaUser className="h-4 w-4 text-[#3581FA]" />
            {notice.createdBy ?? 'Unknown'}
          </div>
          <div className="flex items-center gap-[10px]">
            <IoTime className="h-4 w-4 text-[#3581FA]" />
            {dateFormatter(notice.createTime, 'YYYY-MM-DD HH:mm:ss')}
          </div>
        </div>

        <div
          className="prose mt-4 max-w-none whitespace-pre-wrap text-[16px]"
          dangerouslySetInnerHTML={{ __html: notice.content }}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E5E5E5]">
        {prevNotice && (
          <Link
            href={`/course/${courseId}/notice/${prevNotice.id}`}
            className="flex items-center border-b border-[#E5E5E5] px-6 py-4"
          >
            <span className="w-[110px] text-sm font-semibold text-black">
              Previous
            </span>
            <span className="text-sm text-black">{prevNotice.title}</span>
          </Link>
        )}
        {nextNotice && (
          <Link
            href={`/course/${courseId}/notice/${nextNotice.id}`}
            className="flex items-center px-6 py-4"
          >
            <span className="w-[110px] text-sm font-semibold text-[#3581FA]">
              Next
            </span>
            <span className="text-sm text-black">{nextNotice.title}</span>
          </Link>
        )}
      </div>

      <div className="flex justify-end">
        <Link
          href={basePath}
          className="rounded-full border border-[#D9D9D9] px-6 py-3 text-xs text-black hover:bg-gray-50"
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
