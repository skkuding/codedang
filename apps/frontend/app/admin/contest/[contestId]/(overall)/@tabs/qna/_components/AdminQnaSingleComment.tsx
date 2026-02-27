import { dateFormatter } from '@/libs/utils'
import type { GetContestQnaQuery } from '@generated/graphql'
import React, { type ReactElement } from 'react'
import { FaCircleCheck } from 'react-icons/fa6'

// Qna 쿼리에서 규정된 comment의 타입.
export type QnaCommentFromQuery = NonNullable<
  NonNullable<GetContestQnaQuery['getContestQnA']['comments']>
>[number]

export function AdminQnaSingleComment({
  comment,
  DeleteButtonComponent
}: {
  comment: QnaCommentFromQuery
  DeleteButtonComponent: ReactElement | undefined
}) {
  return (
    <div className="border-line-default flex flex-col gap-[16px] rounded-xl border border-[1px] border-solid p-[24px]">
      <div className="flex flex-col gap-[2px]">
        <div className="relative flex items-center gap-[4px]">
          <span className="text-title1_sb_20">
            {comment.createdBy?.username}
          </span>
          {comment.isContestStaff && (
            <div className="grid h-[24px] w-[24px] place-content-center">
              <FaCircleCheck size={21} className="text-color-blue-50" />
            </div>
          )}
          <div className="absolute right-0 top-0">{DeleteButtonComponent}</div>
        </div>
        <div className="text-body2_m_14 flex items-center gap-[4px] text-[#787E80]">
          <span>
            {dateFormatter(new Date(comment.createdTime), 'YYYY-MM-DD')}
          </span>
          <span>
            {dateFormatter(new Date(comment.createdTime), 'HH:mm:ss')}
          </span>
        </div>
      </div>
      <span className="text-body3_r_16 whitespace-pre-wrap break-all">
        {comment.content.trim()}
      </span>
    </div>
  )
}
