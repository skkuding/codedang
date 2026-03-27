'use client'

import { profileQueries } from '@/app/(client)/_libs/queries/profile'
import { AlertModal } from '@/components/AlertModal'
import { safeFetcherWithAuth, dateFormatter } from '@/libs/utils'
import type {
  CourseNoticeCommentGroup,
  CourseNoticeDetailResponse
} from '@/types/type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { FaUser } from 'react-icons/fa6'
import { IoTime } from 'react-icons/io5'
import { toast } from 'sonner'
import { NoticeCommentsSection } from './NoticeCommentsSection'

const profileInitialData = {
  username: '',
  userProfile: {
    realName: ''
  },
  studentId: '',
  college: '',
  major: '',
  email: ''
}

export function NoticeDetailView() {
  const { courseId, noticeId } = useParams()
  const currentId = Number(noticeId)
  const queryClient = useQueryClient()
  const basePath = `/course/${courseId}/notice`

  const [commentContent, setCommentContent] = useState('')
  const [commentSecret, setCommentSecret] = useState(false)

  const [replyTargetId, setReplyTargetId] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replySecret, setReplySecret] = useState(false)

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [editingSecret, setEditingSecret] = useState(false)

  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  )

  const { data: profile } = useQuery({
    ...profileQueries.fetch(),
    initialData: profileInitialData,
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

  const { data: groupedComments = [], isLoading: isCommentsLoading } = useQuery(
    {
      queryKey: ['courseNoticeComments', currentId],
      queryFn: () =>
        safeFetcherWithAuth
          .get(`course/notice/${currentId}/comment`, {
            searchParams: { take: '100' }
          })
          .json<CourseNoticeCommentGroup[]>(),
      enabled: Number.isFinite(currentId)
    }
  )

  const invalidateNoticeDetail = () => {
    queryClient.invalidateQueries({
      queryKey: ['courseNoticeDetail', currentId]
    })
    queryClient.invalidateQueries({
      queryKey: ['courseNotices', courseId]
    })
  }

  const invalidateComments = () => {
    queryClient.invalidateQueries({
      queryKey: ['courseNoticeComments', currentId]
    })
  }

  const markDeletedInGroups = (
    groups: CourseNoticeCommentGroup[],
    commentId: number
  ): CourseNoticeCommentGroup[] =>
    groups.map((group) => {
      if (group.comment.id === commentId) {
        return {
          ...group,
          comment: {
            ...group.comment,
            isDeleted: true
          }
        }
      }

      return {
        ...group,
        replys: group.replys.map((reply) =>
          reply.id === commentId
            ? {
                ...reply,
                isDeleted: true
              }
            : reply
        )
      }
    })

  const resetCreateState = () => {
    setCommentContent('')
    setCommentSecret(false)
    setReplyTargetId(null)
    setReplyContent('')
    setReplySecret(false)
  }

  const resetEditState = () => {
    setEditingCommentId(null)
    setEditingContent('')
    setEditingSecret(false)
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
      resetCreateState()
      invalidateComments()
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
      resetEditState()
      invalidateComments()
    },
    onError: () => {
      toast.error('Failed to update comment.')
    }
  })

  const { mutate: deleteComment, isPending: isDeletingComment } = useMutation({
    mutationFn: (commentId: number) =>
      safeFetcherWithAuth.delete(
        `course/notice/${currentId}/comment/${commentId}`
      ),

    onMutate: async (commentId: number) => {
      await queryClient.cancelQueries({
        queryKey: ['courseNoticeComments', currentId]
      })

      const previousComments = queryClient.getQueryData<
        CourseNoticeCommentGroup[]
      >(['courseNoticeComments', currentId])

      queryClient.setQueryData<CourseNoticeCommentGroup[]>(
        ['courseNoticeComments', currentId],
        (old) => markDeletedInGroups(old ?? [], commentId)
      )

      setDeletingCommentId(null)

      return { previousComments }
    },

    onSuccess: () => {
      toast.success('Comment deleted!')
      invalidateNoticeDetail()
    },

    onError: (_error, _commentId, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ['courseNoticeComments', currentId],
          context.previousComments
        )
      }
      toast.error('Failed to delete comment.')
    }
  })

  const handleCreateComment = () => {
    createComment({
      content: commentContent,
      isSecret: commentSecret
    })
  }

  const handleCreateReply = (commentId: number) => {
    createComment({
      content: replyContent,
      isSecret: replySecret,
      replyOnId: commentId
    })
  }

  const handleUpdateComment = (commentId: number) => {
    updateComment({
      commentId,
      content: editingContent,
      isSecret: editingSecret
    })
  }

  const handleDeleteComment = () => {
    if (deletingCommentId === null) {
      return
    }
    deleteComment(deletingCommentId)
  }

  const notice = noticeData?.current
  const prevNotice = noticeData?.prev ?? null
  const nextNotice = noticeData?.next ?? null
  const commentCount = notice?._count?.CourseNoticeComment ?? 0

  if (!notice) {
    return null
  }

  return (
    <>
      <div className="mt-20 flex flex-col gap-[60px] pl-10 pr-[116px]">
        <div className="flex flex-col gap-6">
          <div className="bg-color-neutral-99 text-color-neutral-60 flex w-fit items-center gap-2 rounded-full px-4 py-[6px] text-sm">
            No. {currentId}
          </div>

          <div className="flex flex-col gap-4 pb-8">
            <h1 className="text-2xl font-semibold leading-[1.4]">
              {notice.title}
            </h1>

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
        </div>

        <div>
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
            onCreateComment={handleCreateComment}
            replyTargetId={replyTargetId}
            setReplyTargetId={setReplyTargetId}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            replySecret={replySecret}
            setReplySecret={setReplySecret}
            onCreateReply={handleCreateReply}
            editingCommentId={editingCommentId}
            setEditingCommentId={setEditingCommentId}
            editingContent={editingContent}
            setEditingContent={setEditingContent}
            editingSecret={editingSecret}
            setEditingSecret={setEditingSecret}
            isUpdatingComment={isUpdatingComment}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={setDeletingCommentId}
          />
        </div>
      </div>

      <AlertModal
        open={deletingCommentId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingCommentId(null)
          }
        }}
        type="warning"
        title="Delete comment?"
        description={
          'Are you sure you want to delete this comment?\nThis action cannot be undone.'
        }
        primaryButton={{
          text: isDeletingComment ? 'Deleting...' : 'Delete',
          onClick: handleDeleteComment
        }}
      />
    </>
  )
}
