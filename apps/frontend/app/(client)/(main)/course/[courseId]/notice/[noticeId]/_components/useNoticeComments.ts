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
    queryClient.invalidateQueries({ queryKey: ['courseNotices', courseId] })
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
        return { ...group, comment: { ...group.comment, isDeleted: true } }
      }
      return {
        ...group,
        replys: group.replys.map((reply) =>
          reply.id === commentId ? { ...reply, isDeleted: true } : reply
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

  return {
    groupedComments,
    isCommentsLoading,
    commentContent,
    setCommentContent,
    commentSecret,
    setCommentSecret,
    replyTargetId,
    setReplyTargetId,
    replyContent,
    setReplyContent,
    replySecret,
    setReplySecret,
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
