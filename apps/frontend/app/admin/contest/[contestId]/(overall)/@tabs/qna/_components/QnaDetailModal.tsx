'use client'

import { ErrorPage } from '@/app/(client)/(main)/contest/[contestId]/@tabs/qna/[qnaId]/_components/QnaErrorPage'
import { DeleteButton } from '@/components/DeleteButton'
import { Modal } from '@/components/Modal'
import { DELETE_CONTEST_QNA } from '@/graphql/contest/mutations'
import { GET_CONTEST_QNA } from '@/graphql/contest/queries'
import { GET_CONTEST_PROBLEMS } from '@/graphql/problem/queries'
import { useSession } from '@/libs/hooks/useSession'
import { useMutation, useQuery } from '@apollo/client'
import { useTranslate } from '@tolgee/react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { AdminQnaCommentArea } from './AdminQnaCommentArea'
import { AdminQnaContentArea } from './AdminQnaContentArea'
import { useQnaCommentsSync } from './context/RefetchingQnaStoreProvider'

export function QnaDetailModal({
  open,
  onOpenChange,
  qnaOrder
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  qnaOrder: number
}) {
  const { contestId } = useParams<{ contestId: string }>()
  const session = useSession()
  const { t } = useTranslate()

  const { data } = useQuery(GET_CONTEST_QNA, {
    variables: {
      contestId: Number(contestId),
      qnaId: Number(qnaOrder)
    }
  })

  const ContestProblems = useQuery(GET_CONTEST_PROBLEMS, {
    variables: {
      contestId: Number(contestId)
    }
  }).data?.getContestProblems

  const matchedProblem = ContestProblems?.find(
    ({ problemId }) => problemId === data?.getContestQnA?.problemId
  )
  const categoryName = matchedProblem
    ? `${String.fromCharCode(65 + matchedProblem.order)}. ${matchedProblem.problem.title}`
    : data?.getContestQnA?.category

  const [mutate] = useMutation(DELETE_CONTEST_QNA)

  const deleteContestQna = async () => {
    return await mutate({
      variables: { contestId: Number(contestId), qnaId: Number(qnaOrder) }
    })
  }
  const triggerRefresh = useQnaCommentsSync((s) => s.triggerRefresh)

  async function handleDeleteQna() {
    try {
      await deleteContestQna()
      onOpenChange(false)
      toast.success(t('question_deleted_success_message'))
    } catch (error) {
      toast.error(`${t('error_deleting_question_message')}: ${error}`)
    } finally {
      triggerRefresh()
    }
  }

  return (
    <Modal
      size="lg"
      type="custom"
      open={open}
      onOpenChange={onOpenChange}
      title=""
      className="p-0"
    >
      <div className="pr-4">
        {data?.getContestQnA ? (
          <div className="flex w-full flex-col gap-[20px] leading-[150%] tracking-[-3%]">
            <AdminQnaContentArea
              QnaData={data.getContestQnA}
              categoryName={categoryName ?? 'undefined'}
              DeleteButtonComponent={
                <DeleteButton
                  subject={t('question')}
                  handleDelete={() => {
                    handleDeleteQna()
                  }}
                />
              }
            />
            <AdminQnaCommentArea
              QnaData={data.getContestQnA}
              username={session?.user.username}
            />
          </div>
        ) : (
          <ErrorPage
            errorRes={{ message: t('no_qna_error_message'), statusCode: 999 }}
          />
        )}
      </div>
    </Modal>
  )
}
