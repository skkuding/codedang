'use client'

import { fetcherWithAuth } from '@/libs/utils'
import type { GetContestQnaQuery } from '@generated/graphql'
import { useTranslate } from '@tolgee/react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { QnaCommentPostArea } from './QnaCommentPostArea'
import { QnaDetailDeleteButton } from './QnaDetailDeleteButton'
import { QnaSingleComment } from './QnaSingleComment'
import { useQnaCommentSync } from './context/QnaCommentStoreProvider'

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
export function QnaCommentArea({
  QnaData,
  username,
  userId,
  isContestStaff,
  canPostComment
}: {
  QnaData: GetContestQnaQuery['getContestQnA']
  username?: string
  userId: number
  isContestStaff: boolean
  canPostComment: boolean
}) {
  const { t } = useTranslate()
  const { contestId, order: qnaId, comments: initialComments } = QnaData
  const [comments, setComments] = useState(initialComments)
  const [text, setText] = useState('')

  const {
    refreshTrigger: CommentRefreshTrigger,
    triggerRefresh: CommentTriggerRefresh
  } = useQnaCommentSync()

  useEffect(() => {
    async function pollComment() {
      try {
        const QnaRes = await fetcherWithAuth.get(
          `contest/${contestId}/qna/${qnaId}`
        )

        if (!QnaRes.ok) {
          const errorRes: { message: string } = await QnaRes.json()
          toast.error(errorRes.message)
        } else {
          const QnaData: GetContestQnaQuery['getContestQnA'] =
            await QnaRes.json()
          setComments(QnaData.comments)
        }
      } catch (error) {
        toast.error(`Error in re-fetching comments!: ${error}`)
      }
    }
    pollComment()
  }, [contestId, qnaId, CommentRefreshTrigger])

  const onPost = async (): Promise<void> => {
    try {
      const res = await fetcherWithAuth.post(
        `contest/${contestId}/qna/${qnaId}/comment`,
        {
          json: {
            content: text
          }
        }
      )
      if (!res.ok) {
        const errorRes: { message: string } = await res.json()
        toast.error(errorRes.message)
      } else {
        CommentTriggerRefresh()
        toast.success(t('posted_successfully'))
        setText('')
      }
    } catch {
      toast.error(t('error_posting_comment'))
    }
  }

  return (
    <div className="flex flex-col gap-[40px]">
      <div className="flex flex-col gap-[10px]">
        {comments
          ?.sort((a, b) => a.order - b.order)
          .map((comment) => {
            const canDeleteComment =
              userId === comment.createdById || isContestStaff
            return (
              <QnaSingleComment
                key={comment.order}
                comment={comment}
                DeleteButtonComponent={
                  canDeleteComment ? (
                    <QnaDetailDeleteButton
                      subject="comment"
                      DeleteUrl={`contest/${contestId}/qna/${qnaId}/comment/${comment.order}`}
                    />
                  ) : undefined
                }
              />
            )
          })}
      </div>
      {canPostComment && (
        <QnaCommentPostArea
          username={username}
          text={text}
          setText={setText}
          onPost={onPost}
        />
      )}
    </div>
  )
}
