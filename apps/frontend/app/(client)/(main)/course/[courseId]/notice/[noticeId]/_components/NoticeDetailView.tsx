'use client'

import { profileQueries } from '@/app/(client)/_libs/queries/profile'
import { AlertModal } from '@/components/AlertModal'
import { safeFetcherWithAuth, dateFormatter } from '@/libs/utils'
import type { Course, CourseNoticeDetailResponse } from '@/types/type'
import { useQuery } from '@tanstack/react-query'
import DOMPurify from 'isomorphic-dompurify'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FaUser } from 'react-icons/fa6'
import { IoTime } from 'react-icons/io5'
import { NoticeCommentsSection } from './NoticeCommentsSection'
import { useNoticeComments } from './useNoticeComments'

const profileInitialData = {
  username: '',
  userProfile: { realName: '' },
  studentId: '',
  college: '',
  major: '',
  email: ''
}

export function NoticeDetailView() {
  const { courseId, noticeId } = useParams()
  const currentId = Number(noticeId)
  const basePath = `/course/${courseId}/notice`

  const { data: profile } = useQuery({
    ...profileQueries.fetch(),
    initialData: profileInitialData,
    retry: false
  })

  const { data: courseInfo } = useQuery({
    queryKey: ['courseInfo', courseId],
    queryFn: () => safeFetcherWithAuth.get(`course/${courseId}`).json<Course>(),
    enabled: Boolean(courseId),
    retry: false
  })

  const { data: noticeData } = useQuery({
    queryKey: ['courseNoticeDetail', currentId],
    queryFn: () =>
      safeFetcherWithAuth
        .get(`course/notice/${currentId}`)
        .json<CourseNoticeDetailResponse>(),
    enabled: Number.isFinite(currentId)
  })

  const {
    groupedComments,
    isCommentsLoading,
    commentContent,
    setCommentContent,
    commentSecret,
    setCommentSecret,
    replyTargetId,
    setReplyTargetId,
    replyContent,
    setReplyContent,
    replySecret,
    setReplySecret,
    editingCommentId,
    setEditingCommentId,
    editingContent,
    setEditingContent,
    editingSecret,
    setEditingSecret,
    deletingCommentId,
    setDeletingCommentId,
    isCreatingComment,
    isUpdatingComment,
    isDeletingComment,
    createComment,
    updateComment,
    deleteComment
  } = useNoticeComments(currentId, courseId ?? '')

  const isInstructor = courseInfo?.isGroupLeader ?? false
  const notice = noticeData?.current
  const prevNotice = noticeData?.prev ?? null
  const nextNotice = noticeData?.next ?? null
  const commentCount = notice?._count?.CourseNoticeComment ?? 0

  if (!notice) {
    return null
  }

  return (
    <>
      <div className="mt-20 flex flex-col gap-[60px] pl-10 pr-[116px]">
        <div className="flex flex-col gap-6">
          <div className="bg-color-neutral-99 text-color-neutral-60 flex w-fit items-center gap-2 rounded-full px-4 py-[6px] text-sm">
            No. {currentId}
          </div>

          <div className="flex flex-col gap-4 pb-8">
            <h1 className="text-2xl font-semibold leading-[1.4]">
              {notice.title}
            </h1>

            <div className="text-color-neutral-50 flex flex-col gap-[6px] text-[13px]">
              <div className="flex items-center gap-[10px]">
                <FaUser className="h-4 w-4 text-[#3581FA]" />
                {notice.createdBy ?? 'Unknown'}
              </div>
              <div className="flex items-center gap-[10px]">
                <IoTime className="h-4 w-4 text-[#3581FA]" />
                {dateFormatter(notice.createTime, 'YYYY-MM-DD HH:mm:ss')}
              </div>
            </div>

            <div
              className="prose mt-4 max-w-none whitespace-pre-wrap text-[16px]"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(notice.content)
              }}
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-[#E5E5E5]">
            {prevNotice && (
              <Link
                href={`/course/${courseId}/notice/${prevNotice.id}`}
                className="flex items-center border-b border-[#E5E5E5] px-6 py-4"
              >
                <span className="w-[110px] text-sm font-semibold text-black">
                  Previous
                </span>
                <span className="text-sm text-black">{prevNotice.title}</span>
              </Link>
            )}

            {nextNotice && (
              <Link
                href={`/course/${courseId}/notice/${nextNotice.id}`}
                className="flex items-center px-6 py-4"
              >
                <span className="w-[110px] text-sm font-semibold text-[#3581FA]">
                  Next
                </span>
                <span className="text-sm text-black">{nextNotice.title}</span>
              </Link>
            )}
          </div>

          <div className="flex justify-end">
            <Link
              href={basePath}
              className="rounded-full border border-[#D9D9D9] px-6 py-3 text-xs text-black hover:bg-gray-50"
            >
              Back to the List
            </Link>
          </div>
        </div>

        <div>
          <NoticeCommentsSection
            commentCount={commentCount}
            isCommentsLoading={isCommentsLoading}
            groupedComments={groupedComments}
            profileUsername={profile?.username}
            isInstructor={isInstructor}
            commentContent={commentContent}
            setCommentContent={setCommentContent}
            commentSecret={commentSecret}
            setCommentSecret={setCommentSecret}
            isCreatingComment={isCreatingComment}
            onCreateComment={() =>
              createComment({
                content: commentContent,
                isSecret: commentSecret
              })
            }
            replyTargetId={replyTargetId}
            setReplyTargetId={setReplyTargetId}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            replySecret={replySecret}
            setReplySecret={setReplySecret}
            onCreateReply={(commentId) =>
              createComment({
                content: replyContent,
                isSecret: replySecret,
                replyOnId: commentId
              })
            }
            editingCommentId={editingCommentId}
            setEditingCommentId={setEditingCommentId}
            editingContent={editingContent}
            setEditingContent={setEditingContent}
            editingSecret={editingSecret}
            setEditingSecret={setEditingSecret}
            isUpdatingComment={isUpdatingComment}
            onUpdateComment={(commentId) =>
              updateComment({
                commentId,
                content: editingContent,
                isSecret: editingSecret
              })
            }
            onDeleteComment={setDeletingCommentId}
          />
        </div>
      </div>

      <AlertModal
        open={deletingCommentId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingCommentId(null)
          }
        }}
        type="warning"
        title="Delete comment?"
        description={
          'Are you sure you want to delete this comment?\nThis action cannot be undone.'
        }
        primaryButton={{
          text: isDeletingComment ? 'Deleting...' : 'Delete',
          onClick: () => {
            if (deletingCommentId !== null) {
              deleteComment(deletingCommentId)
            }
          }
        }}
      />
    </>
  )
}
