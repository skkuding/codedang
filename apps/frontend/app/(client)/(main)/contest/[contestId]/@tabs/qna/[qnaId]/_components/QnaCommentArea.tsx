'use client'

import { fetcherWithAuth } from '@/libs/utils'
import type { GetContestQnaQuery } from '@generated/graphql'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Qna } from '../page'
import { QnaCommentPostArea } from './QnaCommentPostArea'
import { QnaDeleteButton } from './QnaDeleteButton'
import { QnaSingleComment } from './QnaSingleComment'

/**
 * Qna 댓글 목록, 댓글 작성 영역 컴포넌트
 * @param data
 * Qna 정보
 * @param userInfo
 * 현재 로그인 중인 유저 정보 (username과 email 포함)
 * @param userId
 * 현재 로그인 중인 유저의 id
 * @param isContestStaff
 * 해당 contest의 관리자 여부
 */
export function QnaCommentArea({
  data,
  userInfo,
  userId,
  isContestStaff
}: {
  data: GetContestQnaQuery['getContestQnA']
  userInfo: { username?: string; email?: string }
  userId: number
  isContestStaff: boolean
}) {
  const { contestId, order: qnaId, comments: initialComments } = data
  const [comments, setComments] = useState(initialComments)
  const [text, setText] = useState('')

  useEffect(() => {
    let isMounted = true

    async function poll() {
      try {
        const QnaRes = await fetcherWithAuth.get(
          `contest/${contestId}/qna/${qnaId}`
        )

        if (!QnaRes.ok) {
          const errorRes: { message: string } = await QnaRes.json()
          toast.error(errorRes.message)
        } else {
          const QnaData: Qna = await QnaRes.json()
          if (isMounted) {
            setComments(QnaData.comments)
          }
        }
      } catch (error) {
        toast.error(`Error in re-fetching comments!: ${error}`)
      } finally {
        if (isMounted) {
          setTimeout(poll)
        }
      }
    }
    poll()

    return () => {
      isMounted = false
    }
  }, [contestId, qnaId])

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
        toast.success('Posted successfully!')
        setText('')
      }
    } catch {
      toast.error('Error in posting comment!')
    }
  }

  const canPost = isContestStaff || userId === data.createdById

  return (
    <div className="flex flex-col gap-[40px]">
      <div className="flex flex-col gap-[10px]">
        {comments
          ?.sort((a, b) => a.order - b.order)
          .map((comment) => (
            <QnaSingleComment
              key={comment.order}
              comment={comment}
              userId={userId}
              isContestStaff={isContestStaff}
              DeleteButtonComponent={
                <QnaDeleteButton
                  subject="comment"
                  DeleteUrl={`contest/${contestId}/qna/${qnaId}/comment/${comment.order}`}
                />
              }
            />
          ))}
      </div>
      {canPost && (
        <QnaCommentPostArea
          username={userInfo.username}
          text={text}
          setText={setText}
          onPost={onPost}
        />
      )}
    </div>
  )
}
