import { courseNoticeQueries } from '@/app/(client)/_libs/queries/courseNotice'
import { safeFetcherWithAuth } from '@/libs/utils'
import type { CourseNoticeCommentGroup } from '@/types/type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

export function useNoticeComments(
  currentId: number,
  courseId: string | string[]
) {
  const queryClient = useQueryClient()
  const numericCourseId = Number(courseId)
  const commentsQueryKey = courseNoticeQueries.comments({
    noticeId: currentId
  }).queryKey

  const [commentContent, setCommentContent] = useState('')
  const [commentSecret, setCommentSecret] = useState(false)
  const [openReplyIds, setOpenReplyIds] = useState<Set<number>>(new Set())

  const toggleReplyId = (id: number) => {
    setOpenReplyIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [editingSecret, setEditingSecret] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  )

  const { data: groupedComments = [], isLoading: isCommentsLoading } = useQuery(
    {
      ...courseNoticeQueries.comments({ noticeId: currentId }),
      enabled: Number.isFinite(currentId)
    }
  )

  const invalidateNoticeDetail = () => {
    queryClient.invalidateQueries({
      queryKey: courseNoticeQueries.detail({
        courseId: numericCourseId,
        noticeId: currentId
      }).queryKey
    })
    queryClient.invalidateQueries({
      queryKey: courseNoticeQueries.list({ courseId: numericCourseId }).queryKey
    })
  }

  const invalidateComments = () => {
    queryClient.invalidateQueries({ queryKey: commentsQueryKey })
  }

  const markDeletedInGroups = (
    groups: CourseNoticeCommentGroup[],
    commentId: number
  ): CourseNoticeCommentGroup[] =>
    groups
      .map((group) => {
        if (group.comment.id === commentId) {
          return group.replys.length > 0
            ? { ...group, comment: { ...group.comment, isDeleted: true } }
            : null
        }

        const replys = group.replys.filter((reply) => reply.id !== commentId)
        if (replys.length === group.replys.length) {
          return group
        }
        // 이미 삭제된 원댓글의 마지막 답글이 지워지면 원댓글도 함께 사라진다(cascade).
        if (replys.length === 0 && group.comment.isDeleted) {
          return null
        }
        return { ...group, replys }
      })
      .filter((group): group is CourseNoticeCommentGroup => group !== null)

  const resetCreateState = () => {
    setCommentContent('')
    setCommentSecret(false)
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
          json: { content: payload.content, isSecret: payload.isSecret }
        })
        .json(),
    onSuccess: () => {
      toast.success('Comment updated!')
      resetEditState()
      invalidateComments()
    },
    onError: () => toast.error('Failed to update comment.')
  })

  const { mutate: deleteComment, isPending: isDeletingComment } = useMutation({
    mutationFn: (commentId: number) =>
      safeFetcherWithAuth.delete(
        `course/notice/${currentId}/comment/${commentId}`
      ),
    onMutate: async (commentId: number) => {
      await queryClient.cancelQueries({ queryKey: commentsQueryKey })
      const previousComments =
        queryClient.getQueryData<CourseNoticeCommentGroup[]>(commentsQueryKey)
      queryClient.setQueryData<CourseNoticeCommentGroup[]>(
        commentsQueryKey,
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
        queryClient.setQueryData(commentsQueryKey, context.previousComments)
      }
      toast.error('Failed to delete comment.')
    }
  })

  return {
    groupedComments,
    isCommentsLoading,
    commentContent,
    setCommentContent,
    commentSecret,
    setCommentSecret,
    openReplyIds,
    toggleReplyId,
    editingCommentId,
    setEditingCommentId,
    editingContent,
    setEditingContent,
    editingSecret,
    setEditingSecret,
    deletingCommentId,
    setDeletingCommentId,
    isCreatingComment,
    isUpdatingComment,
    isDeletingComment,
    createComment,
    updateComment,
    deleteComment
  }
}
