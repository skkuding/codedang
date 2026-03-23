'use client'

import { DeleteButton } from '@/components/DeleteButton'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { Separator } from '@/components/shadcn/separator'
import { GET_COURSE } from '@/graphql/course/queries'
import {
  CREATE_COURSE_QNA_COMMENT,
  DELETE_COURSE_QNA,
  DELETE_COURSE_QNA_COMMENT
} from '@/graphql/qna/mutation'
import { GET_COURSE_QNA } from '@/graphql/qna/queries'
import { GET_COURSE_QNAS } from '@/graphql/qna/queries'
import { useSession } from '@/libs/hooks/useSession'
import { dateFormatter } from '@/libs/utils'
import checkBlueIcon from '@/public/icons/check-blue.svg'
import clockIcon from '@/public/icons/clock_blue.svg'
import infoGrayIcon from '@/public/icons/info-gray.svg'
import lockGrayIcon from '@/public/icons/lock-gray.svg'
import penIcon from '@/public/icons/pen.svg'
import userIcon from '@/public/icons/person-fill.svg'
import type { CourseQnAComment } from '@/types/type'
import { useMutation, useSuspenseQuery } from '@apollo/client'
import { Suspense } from '@suspensive/react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface QnaDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  order: number | null
}

export function QnaDetailModal({
  open,
  onOpenChange,
  order
}: QnaDetailModalProps) {
  if (!open || order === null) {
    return null
  }

  return (
    <Modal
      type="custom"
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title=""
    >
      {open && order !== null ? (
        <Suspense fallback={<div className="p-20 text-center">Loading...</div>}>
          <QnaDetailContent order={order} onOpenChange={onOpenChange} />
        </Suspense>
      ) : null}
    </Modal>
  )
}

function QnaDetailContent({
  order,
  onOpenChange
}: {
  order: number
  onOpenChange: (open: boolean) => void
}) {
  const params = useParams()
  const session = useSession()
  const currentUsername = session?.user?.username
  const [commentContent, setCommentContent] = useState('')
  const [postCourseQnaComment] = useMutation(CREATE_COURSE_QNA_COMMENT)
  const [deleteCourseQnaComment] = useMutation(DELETE_COURSE_QNA_COMMENT)

  const { data: qnas } = useSuspenseQuery(GET_COURSE_QNA, {
    variables: {
      groupId: Number(params.courseId),
      order: Number(order)
    }
  })

  const qna = qnas.getCourseQnA

  const [deleteCourseQna] = useMutation(DELETE_COURSE_QNA, {
    variables: { groupId: Number(params.courseId), order: Number(order) },
    refetchQueries: [
      {
        query: GET_COURSE_QNAS,
        variables: { groupId: Number(params.courseId) }
      }
    ],
    onCompleted: () => {
      toast.success('Question deleted successfully!')
      onOpenChange(false)
    },
    onError: () => toast.error('Failed to delete.')
  })

  const postComment = (content: string) => {
    return postCourseQnaComment({
      variables: {
        groupId: Number(params.courseId),
        qnaOrder: Number(order),
        content
      },
      refetchQueries: [
        {
          query: GET_COURSE_QNA,
          variables: { groupId: Number(params.courseId), order: Number(order) }
        }
      ],
      onCompleted: () => {
        setCommentContent('')
        toast.success('Comment posted successfully!')
      },
      onError: () =>
        toast.error('Failed to post the comment. Please try again.')
    })
  }

  const deleteComment = (commentOrder: number) => {
    return deleteCourseQnaComment({
      variables: {
        groupId: Number(params.courseId),
        qnaOrder: Number(order),
        commentOrder
      },
      refetchQueries: [
        {
          query: GET_COURSE_QNA,
          variables: { groupId: Number(params.courseId), order: Number(order) }
        }
      ],
      onCompleted: () => toast.success('Comment deleted successfully!'),
      onError: () =>
        toast.error('Failed to delete the comment. Please try again.')
    })
  }

  const { data: course } = useSuspenseQuery(GET_COURSE, {
    variables: {
      groupId: Number(params.courseId)
    }
  })

  return (
    <div className="flex flex-col gap-5 pr-4">
      <div>
        <div className="flex items-center gap-1">
          <div className="bg-color-neutral-99 text-color-neutral-50 text-caption3_r_13 flex w-fit items-center justify-center rounded-full px-4 py-1">
            {course.getCourse.groupName}
          </div>
          <div className="bg-color-neutral-99 text-color-neutral-50 text-caption3_r_13 flex w-fit items-center justify-center rounded-full px-4 py-1">
            {qna.category}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {qna.isPrivate && (
              <Image
                src={lockGrayIcon}
                alt="lockGrayIcon"
                className="h-6 w-6"
              />
            )}
            <h2 className="text-head5_sb_24">{qna.title}</h2>
          </div>
          <div className="flex gap-2">
            <DeleteButton
              subject="Question"
              handleDelete={() => deleteCourseQna()}
              type="default"
            />
          </div>
        </div>

        <div className="gap-1 pt-4">
          <div className="flex items-center gap-[6px]">
            <div className="flex h-5 w-5 items-center justify-center rounded-full">
              <Image
                src={userIcon}
                alt="userIcon"
                className="h-[18px] w-[18px]"
              />
            </div>
            <span className="text-caption3_r_13 text-color-cool-neutral-50">
              {qna.createdBy?.username}
            </span>
          </div>
          <div className="flex items-center gap-[6px]">
            <Image
              src={clockIcon}
              alt="clockIcon"
              className="h-[18px] w-[18px]"
            />
            <span className="text-caption3_r_13 text-color-cool-neutral-50">
              {dateFormatter(qna.createTime, 'YYYY-MM-DD HH:mm:ss')}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="whitespace-pre-wrap leading-relaxed text-black">
        {qna.content}
      </div>

      <div className="flex flex-col items-center gap-2">
        {qna.comments && qna.comments.length > 0 ? (
          qna.comments.map((comment: CourseQnAComment) => (
            <div
              key={comment.id}
              className="min-h-[160px] w-full rounded-xl border border-[#D8D8D8] px-6 py-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-[2px]">
                  <div className="text-sub2_m_18 flex items-center gap-1">
                    {comment.createdBy?.username}
                    {comment.isCourseStaff && (
                      <Image
                        src={checkBlueIcon}
                        alt="checkBlueIcon"
                        className="h-4 w-4"
                      />
                    )}
                  </div>
                  <div className="text-body2_m_14 text-color-cool-neutral-50">
                    {dateFormatter(comment.createTime, 'YYYY-MM-DD HH:mm:ss')}
                  </div>
                </div>

                <DeleteButton
                  subject="Comment"
                  handleDelete={() => deleteComment(comment.order)}
                  type="compact"
                />
              </div>

              <p className="text-body2_m_16 mt-4 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))
        ) : (
          <div className="bg-color-neutral-99 text-color-neutral-80 flex w-full flex-col items-center justify-center gap-[6px] rounded-lg py-10">
            <Image src={infoGrayIcon} alt="infoGrayIcon" />
            <span>Comments not registered</span>
          </div>
        )}
      </div>

      <div className="border-line mt-4 flex flex-col gap-2 rounded-xl border p-6">
        <span className="text-sub2_m_18">{currentUsername}</span>
        <div className="relative">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Enter Your Answer"
            className="min-h-[72px] w-full resize-none border-none p-0 placeholder:text-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0"
            maxLength={400}
          />
          <div className="text-color-neutral-90 text-body2_m_14 text-right">
            {commentContent.length}/400
          </div>
        </div>
        <Button
          onClick={() => postComment(commentContent)}
          disabled={!commentContent.trim()}
          className="bg-primary text-caption2_m_12 flex h-[38px] w-full items-center justify-center gap-2 rounded-full hover:bg-blue-600"
        >
          <Image src={penIcon} alt="penIcon" />
          Post
        </Button>
      </div>
    </div>
  )
}
