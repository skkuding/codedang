'use client'

import { fetcherWithAuth } from '@/libs/utils'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Qna } from '../page'
import { QnaCommentPostArea } from './QnaCommentPostArea'
import { QnaDeleteButton } from './QnaDeleteButton'
import { QnaSingleComment } from './QnaSingleComment'

export function QnaCommentArea({
  data,
  userInfo,
  userId,
  isContestStaff
}: {
  data: Qna
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
        {comments?.map((comment) => (
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
          userInfo={userInfo}
          text={text}
          setText={setText}
          onPost={onPost}
        />
      )}
    </div>
  )
}
