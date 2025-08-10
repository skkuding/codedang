'use client'

import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { Textarea } from '@/components/shadcn/textarea'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { BiSolidPencil } from 'react-icons/bi'
import { FaCircleCheck, FaClock } from 'react-icons/fa6'
import type { ContestQnAComment, GetCurrentUser, Qna } from '../page'
import { DeleteButton } from './DeleteButton'

// 전반적인 댓글 영역 (댓글, 댓글 게시 영역 등)
export function CommentArea({
  data,
  curUser,
  curUserId,
  isContestStaff
}: {
  data: Qna
  curUser: GetCurrentUser
  curUserId: number
  isContestStaff: boolean
}) {
  // 질문 작성자 혹은 관리자면 댓글 게시 가능.
  const canPost = isContestStaff || curUserId === data.createdBy.id
  return (
    <div className="flex flex-col gap-[40px]">
      <QnaComments
        data={data}
        curUserId={curUserId}
        isContestStaff={isContestStaff}
      />
      {canPost && <CommentPostArea curUser={curUser} />}
    </div>
  )
}

// 댓글들
function QnaComments({
  data,
  curUserId,
  isContestStaff
}: {
  data: Qna
  curUserId: number
  isContestStaff: boolean
}) {
  // TODO: initial data를 state로 저장하고, 해당 state를 interval fetch로 계속 업데이트 해주기. (comments)
  const [comments, setComments] = useState(data.comments)

  return (
    <div className="flex flex-col gap-[10px]">
      {comments.map((comment) => (
        <SingleComment
          key={comment.order}
          comment={comment}
          curUserId={curUserId}
          isContestStaff={isContestStaff}
        />
      ))}
    </div>
  )
}

// 각각의 댓글
function SingleComment({
  comment,
  curUserId,
  isContestStaff
}: {
  comment: ContestQnAComment
  curUserId: number
  isContestStaff: boolean
}) {
  // 작성자 = 로그인 계정 or (로그인 계정 = 관리자 and 댓글 = 관리자 댓글)
  const canDelete =
    curUserId === comment.createdBy.id ||
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
              <DeleteButton subject="comment" comment_order={comment.order} />
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
function CommentPostArea({ curUser }: { curUser: GetCurrentUser }) {
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
  const onPost = (): void => {
    console.log(`${text} is posted!`)
    return
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
        <p className="text-xl font-medium capitalize">{curUser.username}</p>
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
