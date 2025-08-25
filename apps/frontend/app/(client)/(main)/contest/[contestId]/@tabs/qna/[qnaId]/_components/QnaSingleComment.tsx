import type { GetContestQnaQuery } from '@generated/graphql'
import { format } from 'date-fns'
import React, { type ReactElement } from 'react'
import { FaCircleCheck, FaClock } from 'react-icons/fa6'

export type QnaCommentFromQuery = NonNullable<
  NonNullable<GetContestQnaQuery['getContestQnA']['comments']>
>[number]

export function QnaSingleComment({
  comment,
  userId,
  isContestStaff,
  DeleteButtonComponent
}: {
  comment: QnaCommentFromQuery
  userId: number
  isContestStaff: boolean
  DeleteButtonComponent: ReactElement
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
            {comment.createdBy?.username}
          </span>
          {comment.isContestStaff && (
            <div className="grid h-[24px] w-[24px] place-content-center">
              <FaCircleCheck size={21} className="text-color-blue-50" />
            </div>
          )}
          <div className="absolute right-0 top-0">
            {canDelete && DeleteButtonComponent}
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
