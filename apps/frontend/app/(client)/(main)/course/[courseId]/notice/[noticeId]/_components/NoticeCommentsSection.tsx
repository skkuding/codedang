'use client'

import ExclamationMarkIcon from '@/public/icons/exclamation_mark.svg'
import type {
  CourseNoticeCommentGroup,
  CourseNoticeCommentItem
} from '@/types/type'
import { useEffect, useRef, useState } from 'react'
import { NoticeCommentCard } from './NoticeCommentCard'
import { NoticeCommentEditor } from './NoticeCommentEditor'

interface ReplyInputSectionProps {
  commentId: number
  onCreateReply: (commentId: number, content: string, isSecret: boolean) => void
  isCreatingComment: boolean
}

function ReplyInputSection({
  commentId,
  onCreateReply,
  isCreatingComment
}: ReplyInputSectionProps) {
  const [content, setContent] = useState('')
  const [secret, setSecret] = useState(false)

  const handleSubmit = () => {
    onCreateReply(commentId, content, secret)
    setContent('')
    setSecret(false)
  }

  return (
    <NoticeCommentEditor
      value={content}
      setValue={setContent}
      secret={secret}
      setSecret={setSecret}
      compact
      autoResize
      onSubmit={handleSubmit}
      placeholder="Write a reply"
      submitText="Post"
      disabled={!content.trim() || isCreatingComment}
    />
  )
}

interface NoticeCommentsSectionProps {
  commentCount: number
  isCommentsLoading: boolean
  groupedComments: CourseNoticeCommentGroup[]
  profileUsername?: string
  isInstructor?: boolean
  instructorUsernames?: Set<string>

  commentContent: string
  setCommentContent: (value: string) => void
  commentSecret: boolean
  setCommentSecret: (value: boolean) => void
  isCreatingComment: boolean
  onCreateComment: () => void

  openReplyIds: Set<number>
  toggleReplyId: (id: number) => void
  onCreateReply: (commentId: number, content: string, isSecret: boolean) => void

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
  isInstructor = false,
  instructorUsernames,
  commentContent,
  setCommentContent,
  commentSecret,
  setCommentSecret,
  isCreatingComment,
  onCreateComment,
  openReplyIds,
  toggleReplyId,
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
  const editorContainerRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (editingCommentId === null) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        editorContainerRef.current &&
        !editorContainerRef.current.contains(event.target as Node)
      ) {
        cancelEdit()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingCommentId])

  const renderCommentsBody = () => {
    if (isCommentsLoading) {
      return (
        <div className="bg-color-neutral-99 text-color-neutral-60 flex flex-col items-center justify-center rounded-lg py-10">
          <span>Loading comments...</span>
        </div>
      )
    }

    if (groupedComments.length === 0) {
      return (
        <div className="bg-color-neutral-99 flex flex-col items-center justify-center gap-[6px] rounded-[8px] px-5 pb-10 pt-[30px]">
          <ExclamationMarkIcon className="text-color-neutral-80 h-[30px] w-[30px]" />
          <div className="text-sub3_sb_16 text-color-neutral-80">
            Comments not registered
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-[10px]">
        {groupedComments.map((group) => {
          const hasReplySection = openReplyIds.has(group.comment.id)
          const deletedReplies = group.replys.filter((r) => r.isDeleted)
          const hasDeletedReplies = deletedReplies.length > 0

          return (
            <div key={group.comment.id}>
              <NoticeCommentCard
                comment={group.comment}
                replyCount={group.replys.length}
                profileUsername={profileUsername}
                isAdmin={isInstructor}
                instructorUsernames={instructorUsernames}
                isReplyOpen={hasReplySection}
                editingCommentId={editingCommentId}
                editorContainerRef={editorContainerRef}
                onReplyToggle={toggleReplyId}
                onEditStart={startEdit}
                onDelete={onDeleteComment}
                renderEditEditor={() => (
                  <NoticeCommentEditor
                    value={editingContent}
                    setValue={setEditingContent}
                    secret={editingSecret}
                    setSecret={setEditingSecret}
                    onSubmit={() => onUpdateComment(group.comment.id)}
                    placeholder="Edit comment"
                    submitText="Save"
                    disabled={!editingContent.trim() || isUpdatingComment}
                  />
                )}
              />

              {hasDeletedReplies && !hasReplySection && (
                <div className="bg-color-neutral-99 py-3 pl-10 pr-4">
                  <div className="flex flex-col">
                    {deletedReplies.map((reply) => (
                      <NoticeCommentCard
                        key={reply.id}
                        comment={reply}
                        isReply
                        profileUsername={profileUsername}
                        isAdmin={isInstructor}
                        instructorUsernames={instructorUsernames}
                        isReplyOpen={false}
                        editingCommentId={editingCommentId}
                        onReplyToggle={toggleReplyId}
                        onEditStart={startEdit}
                        onDelete={onDeleteComment}
                        renderEditEditor={() => null}
                      />
                    ))}
                  </div>
                </div>
              )}

              {hasReplySection && (
                <>
                  <div className="bg-color-neutral-99 py-3 pl-10 pr-4">
                    <div className="flex flex-col">
                      {group.replys.map((reply) => (
                        <NoticeCommentCard
                          key={reply.id}
                          comment={reply}
                          isReply
                          profileUsername={profileUsername}
                          isAdmin={isInstructor}
                          instructorUsernames={instructorUsernames}
                          isReplyOpen={false}
                          editingCommentId={editingCommentId}
                          editorContainerRef={editorContainerRef}
                          onReplyToggle={toggleReplyId}
                          onEditStart={startEdit}
                          onDelete={onDeleteComment}
                          renderEditEditor={() => (
                            <NoticeCommentEditor
                              value={editingContent}
                              setValue={setEditingContent}
                              secret={editingSecret}
                              setSecret={setEditingSecret}
                              compact
                              autoResize
                              isReplyEdit
                              onSubmit={() => onUpdateComment(reply.id)}
                              placeholder="Edit comment"
                              submitText="Save"
                              disabled={
                                !editingContent.trim() || isUpdatingComment
                              }
                            />
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="border-line rounded-b-xl border border-t-0 bg-white px-6 py-4">
                    <ReplyInputSection
                      commentId={group.comment.id}
                      onCreateReply={onCreateReply}
                      isCreatingComment={isCreatingComment}
                    />
                  </div>
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
