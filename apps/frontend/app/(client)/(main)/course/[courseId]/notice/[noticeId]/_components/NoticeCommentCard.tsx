'use client'

import { dateFormatter } from '@/libs/utils'
import type { CourseNoticeCommentItem } from '@/types/type'

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

  return (
    <div
      style={{
        marginTop: 16,
        marginLeft: isReply ? 24 : 0,
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        padding: 16,
        background: '#FFFFFF'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12
        }}
      >
        <div>
          {displayWriter && (
            <div style={{ fontWeight: 600 }}>{displayWriter}</div>
          )}

          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: '#787E80',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap'
            }}
          >
            <span>
              {dateFormatter(comment.createdTime, 'YYYY-MM-DD HH:mm:ss')}
            </span>
            {isEdited && !comment.isDeleted && <span>Modified</span>}
            {comment.isSecret &&
              !comment.isDeleted &&
              Boolean(comment.createdBy) && <span>Hidden</span>}
          </div>
        </div>

        {(canReply || canEditOrDelete) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0
            }}
          >
            {canReply && (
              <button
                type="button"
                onClick={() => onReplyToggle(comment.id)}
                style={{
                  border: '1px solid #D9D9D9',
                  background: '#FFFFFF',
                  borderRadius: 9999,
                  padding: '6px 12px',
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Reply
              </button>
            )}

            {canEditOrDelete && (
              <>
                <button
                  type="button"
                  onClick={() => onEditStart(comment)}
                  style={{
                    border: '1px solid #D9D9D9',
                    background: '#FFFFFF',
                    borderRadius: 9999,
                    padding: '6px 12px',
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  style={{
                    border: '1px solid #D9D9D9',
                    background: '#FFFFFF',
                    borderRadius: 9999,
                    padding: '6px 12px',
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>
        {displayContent}
      </div>

      {editingCommentId === comment.id && renderEditEditor()}
      {replyTargetId === comment.id && renderReplyEditor()}
    </div>
  )
}
