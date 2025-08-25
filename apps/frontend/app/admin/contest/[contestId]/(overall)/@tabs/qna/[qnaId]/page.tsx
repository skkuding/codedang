'use client'

import { QnaContentArea } from '@/app/(client)/(main)/contest/[contestId]/@tabs/qna/[qnaId]/_components/QnaContentArea'
import { DeleteButton } from '@/components/DeleteButton'
import { DELETE_CONTEST_QNA } from '@/graphql/contest/mutations'
import { GET_CONTEST_QNA } from '@/graphql/contest/queries'
import { useMutation, useQuery } from '@apollo/client'
import { useSession } from 'next-auth/react'
import { use } from 'react'
import { QnaCommentArea } from './_components/QnaCommentArea'

export default function Page(props: {
  params: Promise<{ contestId: string; qnaId: string }>
}) {
  const params = use(props.params)

  const { contestId, qnaId } = params
  const { data, loading, error } = useQuery(GET_CONTEST_QNA, {
    variables: {
      contestId: Number(contestId),
      qnaId: Number(qnaId)
    }
  })

  const qnaData = data?.getContestQnA
  console.log(qnaData)

  const [mutate] = useMutation(DELETE_CONTEST_QNA)

  const deleteContestQna = async () => {
    return await mutate({
      variables: { contestId: Number(contestId), qnaId: Number(qnaId) }
    })
  }
  if (loading) {
    return <span>Loading...</span>
  }
  if (error) {
    return <span>Error: {error.message}</span>
  }
  if (!qnaData) {
    return <span>There is no qna data!</span>
  }

  return (
    <div className="mb-[120px] mt-[80px] flex w-screen max-w-[1440px] flex-col gap-5 gap-[50px] px-[116px] leading-[150%] tracking-[-3%]">
      <QnaContentArea
        data={qnaData}
        canDelete={true}
        DeleteButtonComponent={
          <DeleteButton
            subject={'question'}
            handleDelete={() => {
              deleteContestQna()
            }}
          />
        }
      />
      <QnaCommentArea qnaData={qnaData} />
    </div>
  )
}
