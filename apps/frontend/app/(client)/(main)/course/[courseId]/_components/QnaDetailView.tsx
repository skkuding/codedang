'use client'

import { assignmentProblemQueries } from '@/app/(client)/_libs/queries/assignmentProblem'
import { profileQueries } from '@/app/(client)/_libs/queries/profile'
import { DeleteButton } from '@/components/DeleteButton'
import { Button } from '@/components/shadcn/button'
import { safeFetcherWithAuth } from '@/libs/utils'
import { dateFormatter } from '@/libs/utils'
import arrowLeftIcon from '@/public/icons/arrow-left-black.svg'
import checkBlueIcon from '@/public/icons/check-blue.svg'
import clockBlueIcon from '@/public/icons/clock_blue.svg'
import infoGrayIcon from '@/public/icons/info-gray.svg'
import lockGrayIcon from '@/public/icons/lock-gray.svg'
import penIcon from '@/public/icons/pen.svg'
import userIcon from '@/public/icons/person-fill.svg'
import type { CourseQnAItem } from '@/types/type'
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
  useQuery
} from '@tanstack/react-query'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export function QnaDetailView() {
  const { courseId, order } = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [commentContent, setCommentContent] = useState('')

  const { data: defaultProfileValues } = useQuery({
    ...profileQueries.fetch(),
    initialData: {
      username: '',
      userProfile: {
        realName: ''
      },
      studentId: '',
      college: '',
      major: '',
      email: ''
    },
    retry: false
  })

  const { data: qna } = useSuspenseQuery({
    queryKey: ['courseQna', courseId, order],
    queryFn: () =>
      safeFetcherWithAuth
        .get(`course/${courseId}/qna/${order}`)
        .json<CourseQnAItem>(),
    staleTime: 1000 * 60
  })

  const { data: problemData } = useQuery({
    ...assignmentProblemQueries.list({
      assignmentId: qna.category === 'Problem' ? qna.assignmentId : 0,
      groupId: Number(courseId)
    }),
    enabled: qna.category === 'Problem' && Boolean(qna.assignmentId),
    staleTime: 1000 * 60
  })

  const matchedProblem = problemData?.data?.find((p) => p.id === qna.problemId)

  const { mutate: deleteQna } = useMutation({
    mutationFn: () =>
      safeFetcherWithAuth.delete(`course/${courseId}/qna/${order}`),
    onSuccess: () => {
      toast.success('Successfully deleted!')
      queryClient.invalidateQueries({ queryKey: ['courseQnA', courseId] })
      router.back()
    },
    onError: () => toast.error('You can only delete your own questions!')
  })

  const { mutate: postComment } = useMutation({
    mutationFn: (content: string) =>
      safeFetcherWithAuth
        .post(`course/${courseId}/qna/${order}/comment`, { json: { content } })
        .json(),
    onSuccess: () => {
      toast.success('Comment posted!')
      setCommentContent('')
      queryClient.invalidateQueries({
        queryKey: ['courseQna', courseId, order]
      })
    },
    onError: () => toast.error('Failed to post comment.')
  })

  const { mutate: deleteComment } = useMutation({
    mutationFn: (commentOrder: number) =>
      safeFetcherWithAuth.delete(
        `course/${courseId}/qna/${order}/comment/${commentOrder}`
      ),
    onSuccess: () => {
      toast.success('Comment deleted!')
      queryClient.invalidateQueries({
        queryKey: ['courseQna', courseId, order]
      })
    },
    onError: () => toast.error('You can only delete your own comments!')
  })

  return (
    <div className="mt-20 flex flex-col gap-6 pl-10 pr-[116px]">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-2xl font-semibold"
        >
          <Image
            src={arrowLeftIcon}
            alt="arrowLeftIcon"
            className="h-6 w-6 text-black"
          />{' '}
          Question & Answer
        </button>
        <DeleteButton
          subject="Question"
          handleDelete={() => deleteQna()}
          type="default"
        />
      </div>

      <div className="bg-color-neutral-99 text-color-neutral-60 flex w-fit items-center gap-2 rounded-full px-4 py-[6px] text-sm">
        {qna.category === 'Problem' ? (
          <>
            <span>Assignment</span>
            <span className="text-color-neutral-80">/</span>
            <span>{qna.assignmentTitle}</span>
            <span className="text-color-neutral-80">/</span>
            <span>{matchedProblem?.title || '문제 정보 없음'}</span>
          </>
        ) : (
          <span>General</span>
        )}
      </div>

      <div className="flex flex-col gap-4 pb-8">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          {qna.isPrivate && (
            <Image src={lockGrayIcon} alt="lockGrayIcon" className="h-6 w-6" />
          )}
          {qna.title}
        </h1>
        <div className="text-color-neutral-50 flex flex-col gap-[6px] text-[13px]">
          <div className="flex items-center gap-[10px]">
            <Image src={userIcon} alt="userIcon" className="h-4 w-4" />
            {qna.createdBy?.username}
          </div>
          <div className="flex items-center gap-[10px]">
            <Image
              src={clockBlueIcon}
              alt="clockBlueIcon"
              className="h-4 w-4"
            />
            {dateFormatter(qna.createTime, 'YYYY-MM-DD HH:mm:ss')}
          </div>
        </div>
        <div className="mt-4 whitespace-pre-wrap">{qna.content}</div>
      </div>

      <div className="flex flex-col gap-4">
        <span className="text-2xl font-medium">
          COMMENTS{' '}
          <span className="text-primary">{qna.comments?.length || 0}</span>
        </span>
        {!qna.comments || qna.comments.length === 0 ? (
          <div className="bg-color-neutral-99 text-color-neutral-80 flex flex-col items-center justify-center gap-[6px] rounded-lg py-10">
            <Image src={infoGrayIcon} alt="infoGrayIcon" />
            <span>Comments not registered</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {qna.comments?.map((comment) => {
              const isWriter =
                comment.createdBy?.username === qna.createdBy?.username
              return (
                <div
                  key={comment.id}
                  className="border-line relative flex flex-col gap-[10px] rounded-xl border p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-medium">
                          {comment.createdBy?.username}
                        </span>
                        {isWriter && (
                          <Image src={checkBlueIcon} alt="checkBlueIcon" />
                        )}
                      </div>
                      <div className="text-color-neutral-50 flex items-center gap-1 text-[13px]">
                        <Image
                          src={clockBlueIcon}
                          alt="time"
                          className="h-5 w-5"
                        />
                        {dateFormatter(
                          comment.createTime,
                          'YYYY-MM-DD HH:mm:ss'
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <DeleteButton
                        subject="Comment"
                        handleDelete={() => deleteComment(comment.order)}
                        type="compact"
                      />
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-[16px] font-medium">
                    {comment.content}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        <div className="border-line mt-4 flex flex-col gap-4 rounded-xl border p-6">
          <span className="text-[18px] font-semibold">
            {defaultProfileValues.username}
          </span>
          <div className="relative">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Enter Your Answer"
              className="min-h-[100px] w-full resize-none border-none p-0 placeholder:text-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0"
              maxLength={399}
            />
            <div className="text-color-neutral-90 absolute bottom-0 right-0 text-[16px]">
              {commentContent.length}/400
            </div>
          </div>
          <Button
            onClick={() => postComment(commentContent)}
            disabled={!commentContent.trim()}
            className="bg-primary flex h-12 w-full items-center justify-center gap-2 rounded-full hover:bg-blue-600"
          >
            <Image src={penIcon} alt="penIcon" />
            Post
          </Button>
        </div>
      </div>
    </div>
  )
}
