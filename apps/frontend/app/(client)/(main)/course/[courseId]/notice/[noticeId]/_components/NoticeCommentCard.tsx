'use client'

import { cn, dateFormatter } from '@/libs/utils'
import ExclamationMarkIcon from '@/public/icons/exclamation_mark.svg'
import LockBlueIcon from '@/public/icons/lock_blue.svg'
import TrashcanIcon from '@/public/icons/trashcan2_grey.svg'
import type { CourseNoticeCommentItem } from '@/types/type'
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
    if (isDeleted) {
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
      <div className="bg-color-neutral-95 rounded-xl px-6 py-4">
        {displayWriter && (
          <div className="text-sub2_m_18 mb-2">{displayWriter}</div>
        )}
        <div className="text-body1_m_16 text-color-neutral-60 flex items-center gap-2">
          <ExclamationMarkIcon className="relative top-[-4px] mr-3 h-4 w-4 shrink-0 overflow-visible" />
          {displayContent}
        </div>
      </div>
    )
  }

  if (isReply && isHiddenMasked) {
    return (
      <div className="bg-color-neutral-95 rounded-xl px-6 py-4">
        {displayWriter && (
          <div className="text-sub2_m_18 mb-2">{displayWriter}</div>
        )}
        <div className="text-body1_m_16 text-color-neutral-60 flex items-center gap-2">
          <ExclamationMarkIcon className="relative top-[-4px] mr-3 h-4 w-4 shrink-0 overflow-visible" />
          {displayContent}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        isReply
          ? 'bg-transparent px-0 py-0'
          : cn(
              'border px-6 py-6',
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
                  <span className="bg-color-blue-90 text-caption1_m_13 text-primary rounded-[4px] px-2 py-1">
                    <LockBlueIcon
                      width={14}
                      height={14}
                      className="mr-1 inline-block align-[-2px]"
                    />
                    Hidden
                  </span>
                )}
              </div>
            ) : null}

            <div className="text-caption3_r_13 text-color-cool-neutral-50 flex items-center gap-1">
              <IoTime className="text-color-blue-50 h-[14px] w-[14px]" />
              <span>
                {dateFormatter(
                  isEdited ? comment.updateTime : comment.createdTime,
                  'YYYY-MM-DD HH:mm:ss'
                )}
              </span>

              {isEdited && (
                <span className="bg-color-cool-neutral-95 text-color-cool-neutral-60 text-caption3_r_13 rounded-[4px] px-2 py-1">
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
                  className="text-caption2_m_12 border-primary text-primary flex h-9 items-center justify-center gap-1 rounded-full border py-[9px] pl-[18px] pr-[22px]"
                >
                  <BiSolidPencil className="mr-1 h-[18px] w-[18px]" />
                  Edit
                </button>
              )}

              {canDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  className="w-13 border-color-neutral-90 bg-color-neutral-99 flex h-10 items-center justify-center rounded-full border px-4 py-[10px]"
                >
                  <TrashcanIcon width={20} height={20} />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {!isReply && (
        <div
          className={cn(
            'whitespace-pre-wrap',
            isMasked
              ? 'text-color-neutral-60 text-body1_m_16 flex items-center'
              : 'text-body1_m_16 mt-5'
          )}
        >
          {isMasked ? (
            <ExclamationMarkIcon className="relative top-[-4px] mr-3 h-4 w-4 shrink-0 overflow-visible" />
          ) : (
            comment.isSecret &&
            !comment.isDeleted &&
            !comment.createdBy && (
              <LockBlueIcon
                width={14}
                height={14}
                className="mr-2 inline-block align-[-2px]"
              />
            )
          )}
          {displayContent}
        </div>
      )}

      {isReply && !isDeleted && (
        <div className="text-body1_m_16 mt-5 whitespace-pre-wrap">
          {comment.content}
        </div>
      )}

      {!isReply && (
        <button
          type="button"
          onClick={() => onReplyToggle(comment.id)}
          className={cn(
            'text-caption3_r_13 text-color-neutral-70 border-line border-b',
            isMasked ? 'mt-2' : 'mt-5'
          )}
        >
          {replyTargetId === comment.id ? 'Hide Reply' : 'Reply'}
          {replyTargetId !== comment.id && (
            <span className="text-primary ml-1">{replyCount}</span>
          )}
        </button>
      )}

      {editingCommentId === comment.id && (
        <div className="mt-4">{renderEditEditor()}</div>
      )}
    </div>
  )
}
