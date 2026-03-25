'use client'

import { dateFormatter } from '@/libs/utils'
import { cn } from '@/libs/utils'
import type { CourseNoticeCommentItem } from '@/types/type'
import { FaLock } from 'react-icons/fa6'
import { IoTime } from 'react-icons/io5'

interface NoticeCommentCardProps {
  comment: CourseNoticeCommentItem
  isReply?: boolean
  profileUsername?: string
  replyTargetId: number | null
  editingCommentId: number | null
  onReplyToggle: (commentId: number) => void
  onEditStart: (comment: CourseNoticeCommentItem) => void
  onDelete: (commentId: number) => void
  renderEditEditor: () => React.ReactNode
  renderReplyEditor: () => React.ReactNode
}

export function NoticeCommentCard({
  comment,
  isReply = false,
  profileUsername,
  replyTargetId,
  editingCommentId,
  onReplyToggle,
  onEditStart,
  onDelete,
  renderEditEditor,
  renderReplyEditor
}: NoticeCommentCardProps) {
  const writerUsername = comment.createdBy?.username

  const isMine = Boolean(
    profileUsername && writerUsername && profileUsername === writerUsername
  )

  const canEditOrDelete =
    isMine && !comment.isDeleted && Boolean(comment.createdBy)
  const canReply = !isReply && !comment.isDeleted && Boolean(comment.createdBy)

  const displayContent = (() => {
    if (comment.isDeleted) {
      return comment.replyOnId
        ? 'This is a Deleted Reply'
        : 'This is a Deleted Comment'
    }

    if (!comment.createdBy && comment.isSecret) {
      return comment.replyOnId
        ? 'This is a Hidden Reply'
        : 'This is a Hidden Comment'
    }

    return comment.content
  })()

  const displayWriter = (() => {
    if (comment.isDeleted) {
      return ''
    }
    if (!comment.createdBy && comment.isSecret) {
      return ''
    }
    return comment.createdBy?.username ?? ''
  })()

  const isEdited =
    new Date(comment.createdTime).getTime() !==
    new Date(comment.updateTime).getTime()

  const isMasked = comment.isDeleted || (!comment.createdBy && comment.isSecret)

  return (
    <div
      className={cn(
        'rounded-xl border border-[#E5E5E5] bg-white p-6',
        isReply && 'ml-6 mt-4',
        !isReply && 'mt-4',
        !isMasked && isMine && 'border-[#3581FA]'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          {displayWriter ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-black">
                {displayWriter}
              </span>
              {comment.isSecret &&
                !comment.isDeleted &&
                Boolean(comment.createdBy) && (
                  <span className="rounded bg-[#EAF2FF] px-2 py-0.5 text-xs font-medium text-[#3581FA]">
                    Hidden
                  </span>
                )}
            </div>
          ) : null}

          <div className="flex items-center gap-2 text-[13px] text-[#9A9A9A]">
            <IoTime className="h-3.5 w-3.5 text-[#3581FA]" />
            <span>
              {dateFormatter(comment.createdTime, 'YYYY-MM-DD HH:mm:ss')}
            </span>
            {isEdited && !comment.isDeleted && <span>Modified</span>}
          </div>
        </div>

        {(canReply || canEditOrDelete) && (
          <div className="flex items-center gap-2">
            {canReply && (
              <button
                type="button"
                onClick={() => onReplyToggle(comment.id)}
                className="text-xs text-[#9A9A9A] hover:text-[#3581FA]"
              >
                {replyTargetId === comment.id ? 'Hide Reply' : 'Reply'}
              </button>
            )}

            {canEditOrDelete && (
              <>
                <button
                  type="button"
                  onClick={() => onEditStart(comment)}
                  className="rounded-full border border-[#3581FA] px-5 py-2 text-xs font-medium text-[#3581FA] hover:bg-[#3581FA]/5"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E5E5] text-[#9A9A9A] hover:bg-gray-50"
                >
                  🗑
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div
        className={cn(
          'mt-4 whitespace-pre-wrap text-[15px] font-medium leading-6 text-black',
          isMasked &&
            'rounded-lg bg-[#F5F5F5] px-4 py-3 font-normal text-[#A8A8A8]'
        )}
      >
        {comment.isSecret && !comment.isDeleted && !comment.createdBy && (
          <FaLock className="mr-2 inline h-3.5 w-3.5" />
        )}
        {displayContent}
      </div>

      {editingCommentId === comment.id && renderEditEditor()}
      {replyTargetId === comment.id && renderReplyEditor()}
    </div>
  )
}
