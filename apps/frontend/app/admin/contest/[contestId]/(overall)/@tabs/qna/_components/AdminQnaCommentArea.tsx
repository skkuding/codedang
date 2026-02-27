'use client'

import { useQnaCommentSync } from '@/app/(client)/(main)/contest/[contestId]/@tabs/qna/[qnaId]/_components/context/QnaCommentStoreProvider'
import { DeleteButton } from '@/components/DeleteButton'
import {
  CREATE_CONTEST_QNA_COMMENT,
  DELETE_CONTEST_QNA_COMMENT
} from '@/graphql/contest/mutations'
import { GET_CONTEST_QNA } from '@/graphql/contest/queries'
import { useMutation, useQuery } from '@apollo/client'
import type { GetContestQnaQuery } from '@generated/graphql'
import { useTranslate } from '@tolgee/react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AdminCommentPostArea } from './AdminCommentPostArea'
import { AdminQnaSingleComment } from './AdminQnaSingleComment'

/**
 * Qna 댓글 목록, 댓글 작성 영역 컴포넌트
 * @param QnaData
 * Qna 정보
 * @param username
 * 현재 로그인 중인 유저의 이름
 * @param userId
 * 현재 로그인 중인 유저의 id
 * @param isContestStaff
 * 해당 contest의 관리자 여부
 */
export function AdminQnaCommentArea({
  QnaData,
  username
}: {
  QnaData: GetContestQnaQuery['getContestQnA']
  username?: string
}) {
  const { contestId, order: qnaId, comments: initialComments } = QnaData
  const [comments, setComments] = useState(initialComments)
  const [text, setText] = useState('')

  const {
    refreshTrigger: CommentRefreshTrigger,
    triggerRefresh: CommentTriggerRefresh
  } = useQnaCommentSync()

  const { refetch } = useQuery(GET_CONTEST_QNA, {
    variables: {
      contestId: Number(contestId),
      qnaId: Number(qnaId)
    }
  })

  // TODO: 클라이언트 단에서 댓글 작성 혹은 삭제 시에도 최신화. (같은 zustand 상태 관리를 사용하는데 왜 동기화가 안되지...?)
  useEffect(() => {
    async function RefetchQna() {
      const refetched = await refetch()
      setComments(refetched.data.getContestQnA.comments)
    }
    RefetchQna()
  }, [CommentRefreshTrigger, refetch])

  const [postCommentMutate] = useMutation(CREATE_CONTEST_QNA_COMMENT)

  const createContestQnaComment = async () => {
    return await postCommentMutate({
      variables: {
        contestId: Number(contestId),
        qnaId: Number(qnaId),
        content: text
      }
    })
  }

  const { t } = useTranslate()

  const onPost = async () => {
    try {
      await createContestQnaComment()
      CommentTriggerRefresh()
      toast.success(t('posted_successfully'))
      setText('')
    } catch {
      toast.error(t('error_in_posting_comment'))
    }
  }

  const [deleteCommentMutate] = useMutation(DELETE_CONTEST_QNA_COMMENT)

  const deleteContestQnaComment = async (commentOrder: number) => {
    return await deleteCommentMutate({
      variables: {
        contestId: Number(contestId),
        qnaId: Number(qnaId),
        commentId: commentOrder
      }
    })
  }

  const handleDeleteComment = async (commentOrder: number) => {
    try {
      await deleteContestQnaComment(commentOrder)
      CommentTriggerRefresh()
      toast.success(t('comment_deleted_successfully'))
    } catch (error) {
      toast.error(t('error_in_deleting_comment', { error: error as string }))
    }
  }

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex flex-col gap-[8px]">
        {comments
          ?.slice()
          .sort((a, b) => a.order - b.order)
          .map((comment) => {
            const canDeleteComment = comment.isContestStaff
            return (
              <AdminQnaSingleComment
                key={comment.order}
                comment={comment}
                DeleteButtonComponent={
                  canDeleteComment ? (
                    <DeleteButton
                      subject="comment"
                      handleDelete={() => {
                        handleDeleteComment(comment.order)
                      }}
                      type="compact"
                    />
                  ) : undefined
                }
              />
            )
          })}
      </div>
      <AdminCommentPostArea
        username={username}
        text={text}
        setText={setText}
        onPost={onPost}
      />
    </div>
  )
}
