'use client'

import type {
  CourseNoticeCommentGroup,
  CourseNoticeCommentItem
} from '@/types/type'
import { NoticeCommentCard } from './NoticeCommentCard'
import { NoticeCommentEditor } from './NoticeCommentEditor'

interface NoticeCommentsSectionProps {
  commentCount: number
  isCommentsLoading: boolean
  groupedComments: CourseNoticeCommentGroup[]
  profileUsername?: string
  isInstructor?: boolean

  commentContent: string
  setCommentContent: (value: string) => void
  commentSecret: boolean
  setCommentSecret: (value: boolean) => void
  isCreatingComment: boolean
  onCreateComment: () => void

  replyTargetId: number | null
  setReplyTargetId: (value: number | null) => void
  replyContent: string
  setReplyContent: (value: string) => void
  replySecret: boolean
  setReplySecret: (value: boolean) => void
  onCreateReply: (commentId: number) => void

  editingCommentId: number | null
  setEditingCommentId: (value: number | null) => void
  editingContent: string
  setEditingContent: (value: string) => void
  editingSecret: boolean
  setEditingSecret: (value: boolean) => void
  isUpdatingComment: boolean
  onUpdateComment: (commentId: number) => void

  onDeleteComment: (commentId: number) => void
}

export function NoticeCommentsSection({
  commentCount,
  isCommentsLoading,
  groupedComments,
  profileUsername,
  commentContent,
  setCommentContent,
  commentSecret,
  setCommentSecret,
  isCreatingComment,
  onCreateComment,
  replyTargetId,
  setReplyTargetId,
  replyContent,
  setReplyContent,
  replySecret,
  setReplySecret,
  onCreateReply,
  editingCommentId,
  setEditingCommentId,
  editingContent,
  setEditingContent,
  editingSecret,
  setEditingSecret,
  isUpdatingComment,
  onUpdateComment,
  onDeleteComment
}: NoticeCommentsSectionProps) {
  const cancelReply = () => {
    setReplyTargetId(null)
    setReplyContent('')
    setReplySecret(false)
  }

  const startEdit = (comment: CourseNoticeCommentItem) => {
    setEditingCommentId(comment.id)
    setEditingContent(comment.content)
    setEditingSecret(comment.isSecret)
  }

  const cancelEdit = () => {
    setEditingCommentId(null)
    setEditingContent('')
    setEditingSecret(false)
  }

  const toggleReply = (commentId: number) => {
    if (replyTargetId === commentId) {
      cancelReply()
      return
    }

    setReplyTargetId(commentId)
    setReplyContent('')
    setReplySecret(false)
  }

  const renderCommentsBody = () => {
    if (isCommentsLoading) {
      return (
        <div className="flex flex-col items-center justify-center rounded-lg bg-[#F5F5F5] py-10 text-[#B0B0B0]">
          <span>Loading comments...</span>
        </div>
      )
    }

    if (groupedComments.length === 0) {
      return (
        <div className="bg-color-neutral-99 text-color-neutral-80 flex flex-col items-center justify-center gap-[6px] rounded-lg py-10">
          <span className="text-2xl">!</span>
          <span>Comments not registered</span>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-[10px]">
        {groupedComments.map((group) => {
          const hasReplySection =
            group.replys.length > 0 || replyTargetId === group.comment.id

          return (
            <div key={group.comment.id}>
              <NoticeCommentCard
                comment={group.comment}
                replyCount={group.replys.length}
                hasReplySection={hasReplySection}
                profileUsername={profileUsername}
                replyTargetId={replyTargetId}
                editingCommentId={editingCommentId}
                onReplyToggle={toggleReply}
                onEditStart={startEdit}
                onDelete={onDeleteComment}
                renderEditEditor={() => (
                  <NoticeCommentEditor
                    value={editingContent}
                    setValue={setEditingContent}
                    secret={editingSecret}
                    setSecret={setEditingSecret}
                    onSubmit={() => onUpdateComment(group.comment.id)}
                    onCancel={cancelEdit}
                    placeholder="Edit comment"
                    submitText="Save"
                    disabled={!editingContent.trim() || isUpdatingComment}
                  />
                )}
                renderReplyEditor={() => null}
              />

              {hasReplySection && (
                <>
                  <div className="bg-[#F5F5F5] py-3 pl-10 pr-4">
                    <div className="flex flex-col gap-12 p-6">
                      {group.replys.map((reply) => (
                        <NoticeCommentCard
                          key={reply.id}
                          comment={reply}
                          isReply
                          profileUsername={profileUsername}
                          replyTargetId={replyTargetId}
                          editingCommentId={editingCommentId}
                          onReplyToggle={toggleReply}
                          onEditStart={startEdit}
                          onDelete={onDeleteComment}
                          renderEditEditor={() => (
                            <div className="mt-4 rounded-xl bg-[#F5F5F5] p-0">
                              <NoticeCommentEditor
                                value={editingContent}
                                setValue={setEditingContent}
                                secret={editingSecret}
                                setSecret={setEditingSecret}
                                compact
                                autoResize
                                onSubmit={() => onUpdateComment(reply.id)}
                                onCancel={cancelEdit}
                                placeholder="Edit comment"
                                submitText="Save"
                                disabled={
                                  !editingContent.trim() || isUpdatingComment
                                }
                              />
                            </div>
                          )}
                          renderReplyEditor={() => null}
                        />
                      ))}
                    </div>
                  </div>

                  {replyTargetId === group.comment.id && (
                    <div className="rounded-b-xl border border-t-0 border-[#E5E5E5] bg-white px-6 py-4">
                      <NoticeCommentEditor
                        value={replyContent}
                        setValue={setReplyContent}
                        secret={replySecret}
                        setSecret={setReplySecret}
                        compact
                        autoResize
                        onSubmit={() => onCreateReply(group.comment.id)}
                        onCancel={cancelReply}
                        placeholder="Write a reply"
                        submitText="Post"
                        disabled={!replyContent.trim() || isCreatingComment}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <span className="text-head6_m_24">
        COMMENTS <span className="text-primary">{commentCount}</span>
      </span>

      {renderCommentsBody()}

      <NoticeCommentEditor
        value={commentContent}
        setValue={setCommentContent}
        secret={commentSecret}
        setSecret={setCommentSecret}
        onSubmit={onCreateComment}
        placeholder="Enter Your Answer"
        submitText="Post"
        disabled={!commentContent.trim() || isCreatingComment}
      />
    </div>
  )
}
