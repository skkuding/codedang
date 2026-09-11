'use client'

import { cn, dateFormatter } from '@/libs/utils'
import ClockIcon from '@/public/icons/clock.svg'
import ExclamationMarkIcon from '@/public/icons/exclamation_mark.svg'
import LockBlueIcon from '@/public/icons/lock_blue.svg'
import PenIcon from '@/public/icons/pen.svg'
import TrashcanIcon from '@/public/icons/trashcan2_grey.svg'
import type { CourseNoticeCommentItem } from '@/types/type'
import type { RefObject } from 'react'

interface NoticeCommentCardProps {
  comment: CourseNoticeCommentItem
  replyCount?: number
  isReply?: boolean
  profileUsername?: string
  isAdmin?: boolean
  instructorUsernames?: Set<string>
  isReplyOpen: boolean
  editingCommentId: number | null
  editorContainerRef?: RefObject<HTMLDivElement | null>
  onReplyToggle: (commentId: number) => void
  onEditStart: (comment: CourseNoticeCommentItem) => void
  onDelete: (commentId: number) => void
  renderEditEditor: () => React.ReactNode
}

export function NoticeCommentCard({
  comment,
  replyCount = 0,
  isReply = false,
  profileUsername,
  isAdmin = false,
  instructorUsernames,
  isReplyOpen,
  editingCommentId,
  editorContainerRef,
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
  const isHiddenMasked =
    comment.isSecret && !comment.isDeleted && comment.content === ''

  const canEdit = isMine && !isDeleted && Boolean(comment.createdBy)
  const canDelete =
    !isDeleted && Boolean(comment.createdBy) && (isMine || isAdmin)

  const isWriterInstructor = Boolean(
    writerUsername && instructorUsernames?.has(writerUsername)
  )

  const displayWriter = (() => {
    if (isDeleted) {
      return ''
    }

    if (!writerUsername) {
      return ''
    }

    if (isWriterInstructor) {
      return `${writerUsername} (Instructor)`
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
      <div className="bg-color-neutral-95 flex items-center gap-1 px-6 py-4">
        <ExclamationMarkIcon className="text-color-neutral-80 size-6" />
        <span className="text-sub2_m_18 text-color-neutral-50">
          This is a Deleted Reply
        </span>
      </div>
    )
  }

  if (isReply && isHiddenMasked) {
    return (
      <div className="flex flex-col gap-5 bg-transparent p-6">
        <div className="flex flex-col gap-[2px]">
          <span className="text-sub2_m_18">{displayWriter}</span>

          <div className="text-caption3_r_13 text-color-cool-neutral-50 flex items-center gap-1">
            <ClockIcon className="text-primary h-[18px] w-[18px]" />
            <span>
              {dateFormatter(comment.createdTime, 'YYYY-MM-DD HH:mm:ss')}
            </span>
          </div>
        </div>

        <div className="bg-color-neutral-95 flex items-center justify-start gap-1 rounded-[12px] px-6 py-4">
          <ExclamationMarkIcon className="text-color-neutral-80 size-6" />
          <span className="text-sub2_m_18 text-color-neutral-60">
            {displayContent}
          </span>
        </div>
      </div>
    )
  }

  if (!isReply && isDeleted) {
    return (
      <div
        className={cn(
          'flex flex-col gap-2 rounded-[12px] border bg-white p-6',
          isMine ? 'border-primary' : 'border-line'
        )}
      >
        <div className="flex items-center justify-start gap-1">
          <ExclamationMarkIcon className="text-color-neutral-70 size-6" />
          <span className="text-sub2_m_18 text-color-neutral-50">
            This is a Deleted Comment
          </span>
        </div>
        <button
          type="button"
          onClick={() => onReplyToggle(comment.id)}
          className="text-caption3_r_13 text-color-neutral-70 border-line w-fit border-b"
        >
          {isReplyOpen ? 'Hide Reply' : 'Reply'}
          {!isReplyOpen && (
            <span className="text-primary ml-1">{replyCount}</span>
          )}
        </button>
      </div>
    )
  }

  if (!isReply) {
    const showHiddenBadge = comment.isSecret && Boolean(comment.createdBy)

    const nameTimeBlock = (
      <div className="flex flex-col gap-[2px]">
        <div className="flex items-center gap-2">
          <span className="text-sub2_m_18">{displayWriter}</span>

          {showHiddenBadge && (
            <span className="bg-color-blue-90 text-primary text-caption3_r_13 flex items-center gap-1 rounded-[4px] px-2 py-1">
              <LockBlueIcon className="text-primary size-4" />
              Hidden
            </span>
          )}
        </div>

        <div className="text-caption3_r_13 text-color-cool-neutral-50 flex items-center gap-1">
          <ClockIcon className="text-primary h-[18px] w-[18px]" />
          <span>
            {dateFormatter(
              isEdited ? comment.updateTime : comment.createdTime,
              'YYYY-MM-DD HH:mm:ss'
            )}
          </span>

          {isEdited && (
            <span className="bg-color-cool-neutral-95 text-color-cool-neutral-60 text-caption3_r_13 rounded-[2px] px-[6px] py-[2px]">
              Modified
            </span>
          )}
        </div>
      </div>
    )

    return (
      <div
        className={cn(
          'flex flex-col gap-5 rounded-[12px] border bg-white p-6',
          isMine ? 'border-primary' : 'border-line'
        )}
      >
        {canEdit || canDelete ? (
          <div className="flex items-start justify-between gap-6">
            {nameTimeBlock}
            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onEditStart(comment)}
                  className="text-caption2_m_12 border-primary text-primary flex h-9 items-center justify-center gap-1 rounded-full border bg-white py-[9px] pl-[18px] pr-[22px]"
                >
                  <PenIcon className="h-[18px] w-[18px]" />
                  Edit
                </button>
              )}

              {canDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  className="border-color-neutral-90 bg-color-neutral-99 flex h-10 items-center justify-center rounded-full border px-4 py-[10px]"
                >
                  <TrashcanIcon className="text-color-neutral-70 size-5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          nameTimeBlock
        )}

        {isHiddenMasked ? (
          <div className="bg-color-neutral-99 flex items-center justify-start gap-1 rounded-[12px] px-6 py-4">
            <ExclamationMarkIcon className="text-color-neutral-80 size-6" />
            <span className="text-sub2_m_18 text-color-neutral-60">
              This is a Hidden Comment
            </span>
          </div>
        ) : (
          <div className="text-body1_m_16 whitespace-pre-wrap">
            {comment.content}
          </div>
        )}

        <button
          type="button"
          onClick={() => onReplyToggle(comment.id)}
          className="text-caption3_r_13 text-color-neutral-70 border-line w-fit border-b"
        >
          {isReplyOpen ? 'Hide Reply' : 'Reply'}
          {!isReplyOpen && (
            <span className="text-primary ml-1">{replyCount}</span>
          )}
        </button>

        {editingCommentId === comment.id && (
          <div ref={editorContainerRef}>{renderEditEditor()}</div>
        )}
      </div>
    )
  }

  const showHiddenBadge = comment.isSecret && Boolean(comment.createdBy)

  const nameTimeBlock = (
    <div className="flex flex-col gap-[2px]">
      <div className="flex items-center gap-2">
        <span className="text-sub2_m_18">{displayWriter}</span>

        {showHiddenBadge && (
          <span className="bg-color-blue-90 text-primary text-caption3_r_13 flex items-center gap-1 rounded-[4px] px-2 py-1">
            <LockBlueIcon className="text-primary size-4" />
            Hidden
          </span>
        )}
      </div>

      <div className="text-caption3_r_13 text-color-cool-neutral-50 flex items-center gap-1">
        <ClockIcon className="text-primary h-[18px] w-[18px]" />
        <span>
          {dateFormatter(
            isEdited ? comment.updateTime : comment.createdTime,
            'YYYY-MM-DD HH:mm:ss'
          )}
        </span>

        {isEdited && (
          <span className="bg-color-cool-neutral-95 text-color-cool-neutral-60 text-caption3_r_13 rounded-[2px] px-[6px] py-[2px]">
            Modified
          </span>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-5 bg-transparent p-6">
      {canEdit || canDelete ? (
        <div className="flex items-start justify-between gap-6">
          {nameTimeBlock}
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => onEditStart(comment)}
                className="text-caption2_m_12 border-primary text-primary flex h-9 items-center justify-center gap-1 rounded-full border bg-white py-[9px] pl-[18px] pr-[22px]"
              >
                <PenIcon className="mr-1 h-[18px] w-[18px]" />
                Edit
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                className="border-color-neutral-90 flex h-10 items-center justify-center rounded-full border bg-white px-4 py-[10px]"
              >
                <TrashcanIcon className="text-color-neutral-70 size-5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        nameTimeBlock
      )}

      <div className="text-body1_m_16 whitespace-pre-wrap">
        {comment.content}
      </div>

      {editingCommentId === comment.id && (
        <div ref={editorContainerRef}>{renderEditEditor()}</div>
      )}
    </div>
  )
}
