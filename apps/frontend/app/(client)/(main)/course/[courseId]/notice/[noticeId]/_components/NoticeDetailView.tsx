'use client'

import { ArticleNavigation } from '@/app/(client)/(main)/_components/ArticleNavigation'
import { courseNoticeQueries } from '@/app/(client)/_libs/queries/courseNotice'
import { profileQueries } from '@/app/(client)/_libs/queries/profile'
import { AlertModal } from '@/components/AlertModal'
import { safeFetcherWithAuth, dateFormatter } from '@/libs/utils'
import ClockIcon from '@/public/icons/clock.svg'
import PersonFillIcon from '@/public/icons/person-fill.svg'
import type { Course, CourseNoticeListItem } from '@/types/type'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import DOMPurify from 'isomorphic-dompurify'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'
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

const getTime = (notice: CourseNoticeListItem) =>
  new Date(notice.createTime ?? notice.updateTime ?? 0).getTime()

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

  const { data: leaderUsernames = [] } = useQuery({
    queryKey: ['groupLeaders', courseId],
    queryFn: () =>
      safeFetcherWithAuth.get(`group/${courseId}/leaders`).json<string[]>(),
    enabled: Boolean(courseId),
    retry: false
  })

  const instructorUsernames = useMemo(
    () => new Set(leaderUsernames),
    [leaderUsernames]
  )

  const { data: noticeData } = useSuspenseQuery(
    courseNoticeQueries.detail({
      courseId: Number(courseId),
      noticeId: currentId
    })
  )

  const { data: courseNotices = [] } = useQuery({
    ...courseNoticeQueries.list({ courseId: Number(courseId) }),
    enabled: Boolean(courseId)
  })

  const sortedNotices = useMemo(
    () => [...courseNotices].sort((a, b) => getTime(a) - getTime(b)),
    [courseNotices]
  )

  const currentIndex = sortedNotices.findIndex((n) => n.id === currentId)
  const noticeNumber = currentIndex === -1 ? currentId : currentIndex + 1

  const {
    groupedComments,
    isCommentsLoading,
    commentContent,
    setCommentContent,
    commentSecret,
    setCommentSecret,
    openReplyIds,
    toggleReplyId,
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
  const notice = noticeData.current
  const prevNotice = currentIndex > 0 ? sortedNotices[currentIndex - 1] : null
  const nextNotice =
    currentIndex !== -1 && currentIndex < sortedNotices.length - 1
      ? sortedNotices[currentIndex + 1]
      : null
  const commentCount = notice._count?.CourseNoticeComment ?? 0

  return (
    <>
      <div className="flex flex-col gap-[60px] pl-10 pr-[116px] pt-24">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-[14px]">
              <div className="bg-color-neutral-99 text-color-neutral-60 flex w-fit items-center rounded-full px-4 py-1">
                No. {noticeNumber}
              </div>

              <h1 className="text-head5_sb_24">{notice.title}</h1>
            </div>

            <div className="flex flex-col gap-[6px]">
              <div className="text-caption3_r_13 text-color-cool-neutral-50 flex items-center gap-[10px]">
                <PersonFillIcon className="text-primary size-4" />
                {notice.createdBy ?? 'Unknown'}
              </div>
              <div className="text-caption3_r_13 text-color-cool-neutral-50 flex items-center gap-[10px]">
                <ClockIcon className="text-primary size-4" />
                {dateFormatter(notice.createTime, 'YYYY-MM-DD HH:mm:ss')}
              </div>
            </div>
          </div>

          <div
            className="prose text-body1_m_16 max-w-none whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(notice.content)
            }}
          />

          <div className="mt-[10px]">
            <ArticleNavigation
              prev={
                prevNotice
                  ? { id: String(prevNotice.id), title: prevNotice.title }
                  : undefined
              }
              next={
                nextNotice
                  ? { id: String(nextNotice.id), title: nextNotice.title }
                  : undefined
              }
              basePath={basePath}
            />
          </div>
        </div>

        <NoticeCommentsSection
          commentCount={commentCount}
          isCommentsLoading={isCommentsLoading}
          groupedComments={groupedComments}
          profileUsername={profile?.username}
          isInstructor={isInstructor}
          instructorUsernames={instructorUsernames}
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
          openReplyIds={openReplyIds}
          toggleReplyId={toggleReplyId}
          onCreateReply={(commentId, content, isSecret) =>
            createComment({
              content,
              isSecret,
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
