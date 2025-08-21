'use client'

import { Button } from '@/components/shadcn/button'
import { Textarea } from '@/components/shadcn/textarea'
import { fetcherWithAuth } from '@/libs/utils'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { BiSolidPencil } from 'react-icons/bi'
import { FaCircleCheck, FaClock } from 'react-icons/fa6'
import { toast } from 'sonner'
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
  userInfo: { username?: string; email?: string }
  userId: number
  isContestStaff: boolean
}) {
  const { contestId, order, comments } = data
  // 질문 작성자 혹은 관리자면 댓글 게시 가능.
  const canPost = isContestStaff || userId === data.createdById
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
  contestId?: number
  order?: number
  initialComments?: ContestQnAComment[]
  userId: number
  isContestStaff: boolean
}) {
  const [comments, setComments] = useState(initialComments)
  useEffect(() => {
    let isMounted = true

    async function poll() {
      try {
        const QnaRes = await fetcherWithAuth.get(
          `contest/${contestId}/qna/${order}`
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
  }, [contestId, order])

  return (
    <div className="flex flex-col gap-[10px]">
      {comments?.map((comment) => (
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

function SingleComment({
  comment,
  userId,
  isContestStaff
}: {
  comment: ContestQnAComment
  userId: number
  isContestStaff: boolean
}) {
  const canDelete =
    userId === comment.createdById || (comment.isContestStaff && isContestStaff)

  return (
    <div
      className={`border-color-line-default flex flex-col gap-[20px] rounded-xl border border-[1px] border-solid p-[30px]`}
    >
      <div className="flex flex-col gap-[4px]">
        <div className="relative flex items-center gap-[4px]">
          <span className="text-xl font-semibold capitalize">
            {comment.createdBy.username}
          </span>
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
        <div className="flex items-center gap-[8px]">
          <FaClock className="text-color-blue-50" size={13} />
          <div className="flex items-center gap-[4px] text-sm font-medium text-[#787E80]">
            <span>{format(comment.createdTime, 'yyyy-MM-dd')}</span>
            <span>{format(comment.createdTime, 'HH:mm:ss')}</span>
          </div>
        </div>
      </div>
      <span className="whitespace-pre-wrap break-all text-base font-normal">
        {comment.content.trim()}
      </span>
    </div>
  )
}

function CommentPostArea({
  contestId,
  order,
  userInfo
}: {
  contestId?: number
  order?: number
  userInfo: { username?: string; email?: string }
}) {
  const [text, setText] = useState('')

  const onTextChange = (value: string): void => {
    setText(value)
  }

  const onPost = async (): Promise<void> => {
    if (text === '') {
      toast.error('Please enter your answer.')
      return
    }
    try {
      const res = await fetcherWithAuth.post(
        `contest/${contestId}/qna/${order}/comment`,
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

  return (
    <div className="border-color-line-default flex flex-col gap-[20px] rounded-xl border border-solid p-[30px]">
      {/* 작성자 이름과 input field */}
      <div className="flex flex-col gap-[12px]">
        <span className="text-xl font-medium capitalize">
          {userInfo.username}
        </span>
        <div className="flex flex-col gap-[15px]">
          <Textarea
            value={text}
            id="textarea"
            className="placeholder:text-color-neutral-90 min-h-[120px] resize-none whitespace-pre-wrap border-none p-0 text-base shadow-none focus-visible:ring-0"
            placeholder="Enter Your Answer"
            onChange={(value) => onTextChange(value.target.value)}
            maxLength={400}
          />
          <div className="text-color-neutral-90 text-abse right-0 flex justify-end font-medium">
            <span className="px-[10px]">{`${text.length}/400`}</span>
          </div>
        </div>
      </div>
      {/* Post Button */}
      <Button
        type="submit"
        disabled={text.length === 0}
        onClick={onPost}
        className="flex h-[46px] w-full cursor-pointer items-center justify-center gap-[6px]"
      >
        <BiSolidPencil className="white" />
        <p className="text-base font-medium text-white">Post</p>
      </Button>
    </div>
  )
}
