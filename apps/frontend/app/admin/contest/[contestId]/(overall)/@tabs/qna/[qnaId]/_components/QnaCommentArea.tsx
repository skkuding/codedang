'use client'

import { QnaCommentPostArea } from '@/app/(client)/(main)/contest/[contestId]/@tabs/qna/[qnaId]/_components/QnaCommentPostArea'
import { QnaSingleComment } from '@/app/(client)/(main)/contest/[contestId]/@tabs/qna/[qnaId]/_components/QnaSingleComment'
import { DeleteButton } from '@/components/DeleteButton'
import {
  CREATE_CONTEST_QNA_COMMENT,
  DELETE_CONTEST_QNA_COMMENT
} from '@/graphql/contest/mutations'
import { useMutation } from '@apollo/client'
import type { GetContestQnaQuery } from '@generated/graphql'
import React, { useState } from 'react'
import { toast } from 'sonner'

/**
 * Qna 댓글 목록, 댓글 작성 영역 컴포넌트
 * @param qnaData
 * Qna 정보
 */
export function QnaCommentArea({
  qnaData
}: {
  qnaData: GetContestQnaQuery['getContestQnA']
}) {
  const { contestId, order: qnaId, comments } = qnaData
  const [text, setText] = useState('')

  // TODO: data fetching
  // const { data, loading, error } = useQuery(GET_CONTEST_QNA, {
  //   variables: { contestId, qnaId },
  //   pollInterval: 5000 // 5초마다 자동 폴링
  // })

  // if (loading) {
  //   return <div>Loading...</div>
  // }
  // if (error) {
  //   toast.error(`Error fetching comments: ${error.message}`)
  //   return <div>Error!</div>
  // }

  // const comments = data?.getContestQnA?.comments || []

  // TODO: GraphQL로 post 구현.
  const [createQnaCommentMutate] = useMutation(CREATE_CONTEST_QNA_COMMENT)

  const onPost = async () => {
    try {
      const commentId = await createQnaCommentMutate({
        variables: { contestId, qnaId, content: text }
      })
      setText('')
      toast.success(`${commentId}th comment posted successfully!`)
    } catch {
      toast.error('Error in posting comment!')
    }
  }

  const [deleteQnaCommentMutate] = useMutation(DELETE_CONTEST_QNA_COMMENT)

  const deleteQnaComment = async (
    contestId: number,
    qnaId: number,
    commentId: number
  ) => {
    return await deleteQnaCommentMutate({
      variables: { contestId, qnaId, commentId }
    })
  }

  return (
    <div className="flex flex-col gap-[40px]">
      <div className="flex flex-col gap-[10px]">
        {comments
          ?.sort((a, b) => a.order - b.order)
          .map((comment) => (
            <QnaSingleComment
              key={comment.order}
              comment={comment}
              userId={-1}
              isContestStaff={true}
              DeleteButtonComponent={
                <DeleteButton
                  subject="comment"
                  handleDelete={async () => {
                    try {
                      await deleteQnaComment(contestId, qnaId, comment.order)
                      toast.success('comment is deleted successfully!')
                    } catch (error) {
                      toast.error(`Error in deleting comment!: ${error}`)
                    }
                  }}
                />
              }
            />
          ))}
      </div>
      {/* TODO: 현재 유저의 이름 */}
      <QnaCommentPostArea
        username={'ContestAdmin'}
        text={text}
        setText={setText}
        onPost={onPost}
      />
    </div>
  )
}
