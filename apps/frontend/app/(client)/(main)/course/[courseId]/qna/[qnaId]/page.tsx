'use client'

import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { assignmentProblemQueries } from '@/app/(client)/_libs/queries/assignmentProblem'
import { Button } from '@/components/shadcn/button'
import { safeFetcherWithAuth } from '@/libs/utils'
import type { CourseQnAItem } from '@/types/type'
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
  useSuspenseQueries
} from '@tanstack/react-query'
import { ChevronLeft, Lock, User, Clock } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function QnaDetailPage() {
  const { courseId, qnaId } = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: qna } = useSuspenseQuery({
    queryKey: ['courseQna', courseId, qnaId],
    queryFn: () =>
      safeFetcherWithAuth
        .get(`course/${courseId}/qna/${qnaId}`)
        .json<CourseQnAItem>()
  })

  const [assignments, exercises] = useSuspenseQueries({
    queries: [
      assignmentQueries.muliple({
        courseId: Number(courseId),
        isExercise: false
      }),
      assignmentQueries.muliple({
        courseId: Number(courseId),
        isExercise: true
      })
    ]
  }).map((q) => q.data || [])

  const { data: problemData } = useSuspenseQuery(
    assignmentProblemQueries.list({
      assignmentId: qna.groupId,
      groupId: Number(courseId)
    })
  )

  const allTasks = [...assignments, ...exercises]
  const matchedAssignment = allTasks.find((a) => a.id === qna.groupId)
  const matchedProblem = problemData?.data?.find((p) => p.id === qna.problemId)

  const { mutate: deleteQna } = useMutation({
    mutationFn: () =>
      safeFetcherWithAuth.delete(`course/${courseId}/qna/${qnaId}`),
    onSuccess: () => {
      toast.success('successfully deleted!')
      queryClient.invalidateQueries({ queryKey: ['courseQnA', courseId] })
      router.back()
    },
    onError: () => toast.error('failed to delete question.')
  })

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xl font-bold hover:opacity-70"
        >
          <ChevronLeft className="h-6 w-6" />
          Question & Answer
        </button>

        <Button
          variant="outline"
          className="border-red-200 text-red-500 hover:bg-red-50"
          onClick={() => deleteQna()}
        >
          Delete
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span>Assignment</span>
        <span>/</span>

        <span>{matchedAssignment?.title || '과제 정보 없음'}</span>
        <span>/</span>

        <span className="font-medium text-gray-600">
          {matchedProblem?.title || '문제 정보 없음'}
        </span>
      </div>

      <div className="flex flex-col gap-4 border-b pb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          {qna.isPrivate && <Lock className="h-5 w-5 text-gray-400" />}
          {qna.title}
        </h1>

        <div className="flex gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {qna.createdBy?.username}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {new Date(qna.createTime).toLocaleString()}
          </div>
        </div>

        <div className="mt-4 whitespace-pre-wrap leading-relaxed text-gray-800">
          {qna.content}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">
          COMMENTS{' '}
          <span className="text-primary">{qna.comments?.length || 0}</span>
        </h2>

        {!qna.comments || qna.comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-gray-50 py-20 text-gray-400">
            <div className="mb-2 text-4xl">!</div>
            <p>Comments not registered</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">undefined</div>
        )}
      </div>
    </div>
  )
}
