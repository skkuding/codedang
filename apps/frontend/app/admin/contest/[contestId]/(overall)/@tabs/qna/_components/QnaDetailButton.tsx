'use client'

import { ErrorPage } from '@/app/(client)/(main)/contest/[contestId]/@tabs/qna/[qnaId]/_components/QnaErrorPage'
import { DeleteButton } from '@/components/DeleteButton'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { DELETE_CONTEST_QNA } from '@/graphql/contest/mutations'
import { GET_CONTEST_QNA } from '@/graphql/contest/queries'
import { GET_CONTEST_PROBLEMS } from '@/graphql/problem/queries'
import { useSession } from '@/libs/hooks/useSession'
import { useMutation, useQuery } from '@apollo/client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AdminQnaCommentArea } from './AdminQnaCommentArea'
import { AdminQnaContentArea } from './AdminQnaContentArea'

export function QnaDetailButton({ qnaId }: { qnaId: string }) {
  const { contestId } = useParams<{ contestId: string }>()
  const [showModal, setShowModal] = useState(false)
  const session = useSession()

  const { data, refetch } = useQuery(GET_CONTEST_QNA, {
    variables: {
      contestId: Number(contestId),
      qnaId: Number(qnaId)
    }
  })
  const [QnaData, setQnaData] = useState(data?.getContestQnA)

  useEffect(() => {
    async function RefetchQna() {
      const refetched = await refetch()
      setQnaData(refetched.data.getContestQnA)
    }
    RefetchQna()
  }, [refetch, showModal])

  const ContestProblems = useQuery(GET_CONTEST_PROBLEMS, {
    variables: {
      contestId: Number(contestId)
    }
  }).data?.getContestProblems

  const matchedProblem = ContestProblems?.find(
    ({ problemId }) => problemId === QnaData?.problemId
  )
  const categoryName = matchedProblem
    ? `${String.fromCharCode(65 + matchedProblem.order)}. ${matchedProblem.problem.title}`
    : QnaData?.category

  const [mutate] = useMutation(DELETE_CONTEST_QNA)

  const deleteContestQna = async () => {
    return await mutate({
      variables: { contestId: Number(contestId), qnaId: Number(qnaId) }
    })
  }

  // TODO: 로직 확인
  async function handleDeleteQna() {
    try {
      await deleteContestQna()
      setShowModal(false)
      toast.success(`question is deleted successfully!`)
    } catch (error) {
      toast.error(`Error in deleting question!: ${error}`)
    }
  }

  return (
    <Modal
      size="lg"
      type="custom"
      trigger={<Button>Go to qna detail page</Button>}
      open={showModal}
      onOpenChange={setShowModal}
      title=""
      className="h-full! max-h-[1065px]! px-[20px]!"
    >
      <ScrollArea className="h-full max-h-[1065px] px-[20px]">
        {QnaData ? (
          <div className="flex w-full flex-col gap-[20px] leading-[150%] tracking-[-3%]">
            <AdminQnaContentArea
              QnaData={QnaData}
              categoryName={categoryName ?? 'undefined'}
              DeleteButtonComponent={
                <DeleteButton
                  subject="question"
                  handleDelete={() => {
                    handleDeleteQna()
                  }}
                />
              }
            />
            <AdminQnaCommentArea
              QnaData={QnaData}
              username={session?.user.username}
            />
          </div>
        ) : (
          <ErrorPage
            errorRes={{ message: 'There is no such Qna!', statusCode: 999 }}
          />
        )}
      </ScrollArea>
    </Modal>
  )
}
