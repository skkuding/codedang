'use client'

import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { Textarea } from '@/components/shadcn/textarea'
import { fetcherWithAuth } from '@/libs/utils'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { BiSolidPencil } from 'react-icons/bi'
import { FaCircleCheck, FaClock } from 'react-icons/fa6'
import type { ContestQnAComment, Qna } from '../page'
import { DeleteButton } from './DeleteButton'

// 전반적인 댓글 영역 (댓글, 댓글 게시 영역 등)
export function CommentArea({
  data,
  userInfo,
  userId,
  isContestStaff
}: {
  data: Qna
  userInfo: { username: string; email: string }
  userId: number
  isContestStaff: boolean
}) {
  const { contestId, order, comments } = data
  // 질문 작성자 혹은 관리자면 댓글 게시 가능.
  const canPost = isContestStaff || userId === data.createdBy.id
  return (
    <div className="flex flex-col gap-[40px]">
      <QnaComments
        contestId={contestId}
        order={order}
        initialComments={comments}
        userId={userId}
        isContestStaff={isContestStaff}
      />
      {canPost && (
        <CommentPostArea
          contestId={contestId}
          order={order}
          userInfo={userInfo}
        />
      )}
    </div>
  )
}

// 댓글들
function QnaComments({
  contestId,
  order,
  initialComments,
  userId,
  isContestStaff
}: {
  contestId: number
  order: number
  initialComments: ContestQnAComment[]
  userId: number
  isContestStaff: boolean
}) {
  // TODO: initial data를 state로 저장하고, 해당 state를 interval fetch로 계속 업데이트 해주기. (comments)
  const [comments, setComments] = useState(initialComments)
  // setInterval(async () => {
  //   try {
  //     const res: Qna = await fetcherWithAuth
  //       .get(`contest/${contestId}/qna/${order}`)
  //       .json()
  //     setComments(res.comments)
  //   } catch {
  //     console.log('Error in re-fetching comments!')
  //   }
  // }, 3000)
  return (
    <div className="flex flex-col gap-[10px]">
      {comments.map((comment) => (
        <SingleComment
          key={comment.order}
          comment={comment}
          userId={userId}
          isContestStaff={isContestStaff}
        />
      ))}
    </div>
  )
}

// 각각의 댓글
function SingleComment({
  comment,
  userId,
  isContestStaff
}: {
  comment: ContestQnAComment
  userId: number
  isContestStaff: boolean
}) {
  // 작성자 = 로그인 계정 or (로그인 계정 = 관리자 and 댓글 = 관리자 댓글)
  const canDelete =
    userId === comment.createdBy.id ||
    (comment.isContestStaff && isContestStaff)
  return (
    <div
      className={`border-color-line-default flex flex-col gap-[20px] rounded-xl border border-[1px] border-solid p-[30px]`}
    >
      <div className="flex flex-col gap-[4px]">
        {/* 답변자 이름과 인증 마크 */}
        <div className="relative flex items-center gap-[4px]">
          <p className="text-xl font-semibold capitalize">
            {comment.createdBy.username}
          </p>
          {comment.isContestStaff && (
            <div className="grid h-[24px] w-[24px] place-content-center">
              <FaCircleCheck size={21} className="text-color-blue-50" />
            </div>
          )}
          <div className="absolute right-0 top-0">
            {canDelete && (
              <DeleteButton subject="comment" commentOrder={comment.order} />
            )}
          </div>
        </div>
        {/* 날짜 마크와 날짜 */}
        <div className="flex items-center gap-[8px]">
          <FaClock className="text-color-blue-50" size={13} />
          <div className="flex items-center gap-[4px] text-sm font-medium text-[#787E80]">
            <p>{format(comment.createdTime, 'yyyy-MM-dd')}</p>
            <p>{format(comment.createdTime, 'HH:mm:ss')}</p>
          </div>
        </div>
      </div>
      {/* 내용 */}
      <div className="whitespace-pre-line text-base font-normal">
        {comment.content.trim()}
      </div>
    </div>
  )
}

// 댓글 게시 영역
function CommentPostArea({
  contestId,
  order,
  userInfo
}: {
  contestId: number
  order: number
  userInfo: { username: string; email: string }
}) {
  const [text, setText] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (text.length > 400) {
      setShowModal(true)
      setText(text.slice(0, 400))
    }
  }, [text])

  const onTextChange = (value: string): void => {
    setText(value)
  }

  // TODO: 댓글 POST 시 로직 구현.
  const onPost = async (): Promise<void> => {
    try {
      // TODO: response error handling
      const res = await fetcherWithAuth(
        `contest/${contestId}/qna/${order}/comment`,
        {
          method: 'POST',
          body: JSON.stringify({
            content: text
          })
        }
      )
      console.log(`${text} is posted!`)
      console.log(`${res.status}`)
    } catch {
      console.log('Error in posting comment!')
    }
  }

  return (
    <div className="border-color-line-default flex flex-col gap-[20px] rounded-xl border border-solid p-[30px]">
      {showModal && (
        <Modal
          open={showModal}
          onOpenChange={(open) => setShowModal(open)}
          size="sm"
          type="warning"
          title="Answer length exceed"
          headerDescription="Please enter your answer within 400 characters."
          onClose={() => setShowModal(false)}
        />
      )}
      {/* 작성자 이름과 input field */}
      <div className="flex flex-col gap-[12px]">
        <p className="text-xl font-medium capitalize">{userInfo.username}</p>
        <div className="flex flex-col gap-[15px]">
          <Textarea
            value={text}
            id="textarea"
            className="placeholder:text-color-neutral-90 min-h-[120px] resize-none whitespace-pre-line border-none p-0 text-base shadow-none focus-visible:ring-0"
            placeholder="Enter Your Answer"
            onChange={(value) => onTextChange(value.target.value)}
          />
          <div className="text-color-neutral-90 text-abse right-0 flex justify-end font-medium">
            <p className="px-[10px]">{`${text.length}/400`}</p>
          </div>
        </div>
      </div>
      {/* Post Button */}
      <Button
        type="submit"
        onClick={onPost}
        className="flex h-[46px] w-full cursor-pointer items-center justify-center gap-[6px]"
      >
        <BiSolidPencil className="white" />
        <p className="text-base font-medium text-white">Post</p>
      </Button>
    </div>
  )
}
