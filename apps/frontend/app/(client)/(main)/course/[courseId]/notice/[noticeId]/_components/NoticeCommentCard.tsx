'use client'

import { cn, dateFormatter } from '@/libs/utils'
import exclamationMarkIcon from '@/public/icons/exclamation_mark.svg'
import lockBlueIcon from '@/public/icons/lock_blue.svg'
import trashcanIcon from '@/public/icons/trashcan2_grey.svg'
import type { CourseNoticeCommentItem } from '@/types/type'
import Image from 'next/image'
import { BiSolidPencil } from 'react-icons/bi'
import { IoTime } from 'react-icons/io5'

interface NoticeCommentCardProps {
  comment: CourseNoticeCommentItem
  replyCount?: number
  isReply?: boolean
  profileUsername?: string
  isAdmin?: boolean
  replyTargetId: number | null
  editingCommentId: number | null
  onReplyToggle: (commentId: number) => void
  onEditStart: (comment: CourseNoticeCommentItem) => void
  onDelete: (commentId: number) => void
  renderEditEditor: () => React.ReactNode
  hasReplySection?: boolean
}

export function NoticeCommentCard({
  comment,
  replyCount = 0,
  isReply = false,
  profileUsername,
  isAdmin = false,
  hasReplySection = false,
  replyTargetId,
  editingCommentId,
  onReplyToggle,
  onEditStart,
  onDelete,
  renderEditEditor
}: NoticeCommentCardProps) {
  const writerUsername = comment.createdBy?.username ?? ''
  const writerStudentId = comment.createdBy?.studentId ?? ''

  const maskedStudentId = writerStudentId
    ? `${writerStudentId.slice(0, 4)}${'#'.repeat(
        Math.max(writerStudentId.length - 4, 0)
      )}`
    : ''

  const isMine = Boolean(
    profileUsername && writerUsername && profileUsername === writerUsername
  )

  const isEdited =
    new Date(comment.createdTime).getTime() !==
    new Date(comment.updateTime).getTime()

  const isDeleted = comment.isDeleted
  const isHiddenMasked = !comment.createdBy && comment.isSecret
  const isMasked = isDeleted || isHiddenMasked

  const canEdit = isMine && !isDeleted && Boolean(comment.createdBy)
  const canDelete =
    !isDeleted && Boolean(comment.createdBy) && (isMine || isAdmin)

  const displayWriter = (() => {
    if (isDeleted || isHiddenMasked) {
      return ''
    }

    if (!writerUsername) {
      return ''
    }

    if (maskedStudentId) {
      return `${writerUsername} (${maskedStudentId})`
    }

    return writerUsername
  })()

  const displayContent = (() => {
    if (isDeleted) {
      return comment.replyOnId
        ? 'This is a Deleted Reply'
        : 'This is a Deleted Comment'
    }

    if (isHiddenMasked) {
      return comment.replyOnId
        ? 'This is a Hidden Reply'
        : 'This is a Hidden Comment'
    }

    return comment.content
  })()

  if (isReply && isDeleted) {
    return (
      <div className="rounded-xl bg-[#ECECEC] px-4 py-4 text-[15px] leading-6 text-[#9A9A9A]">
        <Image
          src={exclamationMarkIcon}
          alt="deleted"
          width={18}
          height={18}
          className="mr-2 inline-block align-[-3px]"
        />
        {displayContent}
      </div>
    )
  }

  if (isReply && isHiddenMasked) {
    return (
      <div className="rounded-xl bg-[#ECECEC] px-4 py-4 text-[15px] leading-6 text-[#9A9A9A]">
        <Image
          src={exclamationMarkIcon}
          alt="hidden"
          width={18}
          height={18}
          className="mr-2 inline-block align-[-3px]"
        />
        {displayContent}
      </div>
    )
  }

  return (
    <div
      className={cn(
        isReply
          ? 'bg-transparent px-0 py-0'
          : cn(
              'border bg-white px-6 py-6',
              hasReplySection ? 'rounded-b-none rounded-t-xl' : 'rounded-xl'
            ),
        !isReply && !isMasked && isMine
          ? 'border-[#3581FA]'
          : !isReply && 'border-[#E5E5E5]'
      )}
    >
      {!isDeleted && (
        <div className="flex items-start justify-between gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
            {displayWriter ? (
              <div className="flex items-center gap-2">
                <span className="text-sub2_m_18">{displayWriter}</span>

                {comment.isSecret && Boolean(comment.createdBy) && (
                  <span className="rounded-[4px] bg-[#EAF2FF] px-2 py-1 text-xs font-medium leading-none text-[#3581FA]">
                    <Image
                      src={lockBlueIcon}
                      alt="hidden"
                      width={12}
                      height={12}
                      className="mr-1 inline-block align-[-1px]"
                    />
                    Hidden
                  </span>
                )}
              </div>
            ) : null}

            <div className="text-caption3_r_13 flex items-center gap-1 text-neutral-400">
              <IoTime className="h-[14px] w-[14px] text-[#3581FA]" />
              <span>
                {dateFormatter(
                  isEdited ? comment.updateTime : comment.createdTime,
                  'YYYY-MM-DD HH:mm:ss'
                )}
              </span>

              {isEdited && (
                <span className="rounded-[4px] bg-[#EEF1F4] px-2 py-1 text-[12px] leading-none text-[#8B8B8B]">
                  Modified
                </span>
              )}
            </div>
          </div>

          {(canEdit || canDelete) && (
            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onEditStart(comment)}
                  className="text-caption2_m_125 flex h-9 items-center justify-center gap-1 rounded-full border border-blue-500 py-[9px] pl-[18px] pr-[22px] text-blue-500"
                >
                  <BiSolidPencil className="mr-1" />
                  Edit
                </button>
              )}

              {canDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  className="w-13 flex h-10 items-center justify-center rounded-full border border-neutral-300 bg-neutral-200 px-4 py-[10px]"
                >
                  <Image
                    src={trashcanIcon}
                    alt="delete"
                    width={16}
                    height={16}
                  />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {!isReply && (
        <div
          className={cn(
            'mt-5 whitespace-pre-wrap text-[15px] leading-8',
            isMasked
              ? 'rounded-xl bg-[#F5F5F5] px-4 py-3 font-normal text-[#A8A8A8]'
              : 'font-medium text-black'
          )}
        >
          {comment.isSecret && !comment.isDeleted && !comment.createdBy && (
            <Image
              src={lockBlueIcon}
              alt="hidden"
              width={14}
              height={14}
              className="mr-2 inline-block align-[-2px]"
            />
          )}
          {displayContent}
        </div>
      )}

      {isReply && !isDeleted && (
        <div className="text-body1_m_16 mt-5 whitespace-pre-wrap">
          {comment.content}
        </div>
      )}

      {!isReply && !comment.isDeleted && (
        <button
          type="button"
          onClick={() => onReplyToggle(comment.id)}
          className="text-caption3_r_13 mt-5 text-neutral-700"
        >
          {replyTargetId === comment.id ? 'Hide Reply' : 'Reply'}
          {replyTargetId !== comment.id && (
            <span className="ml-1 text-blue-500">{replyCount}</span>
          )}
        </button>
      )}

      {editingCommentId === comment.id && (
        <div className="mt-4">{renderEditEditor()}</div>
      )}
    </div>
  )
}
