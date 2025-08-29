import { Button } from '@/components/shadcn/button'
import { fetcherWithAuth } from '@/libs/utils'
import type { GetContestQnaQuery } from '@generated/graphql'
import { HiTrash } from 'react-icons/hi'
import { QnaCommentArea } from './_components/QnaCommentArea'
import { QnaContentArea } from './_components/QnaContentArea'
import { QnaDetailDeleteButton } from './_components/QnaDetailDeleteButton'
import { ErrorPage } from './_components/QnaErrorPage'

type PageProps = {
  params: Promise<{
    contestId: string
    qnaId: string
  }>
}

interface ContestRole {
  contestId: number
  role: Role
}

type Role = 'Admin' | 'Manager' | 'Participant' | 'Reviewer'

export default async function QnaDetailPage({ params }: PageProps) {
  // Get data
  const { contestId, qnaId } = await params

  const ContestData: { startTime: Date; endTime: Date } = await fetcherWithAuth
    .get(`contest/${contestId}`)
    .json()
  const [startTime, endTime] = [
    new Date(ContestData.startTime),
    new Date(ContestData.endTime)
  ]
  const currentTime = new Date()
  const notOngoing = startTime > currentTime || endTime < currentTime

  const QnaRes = await fetcherWithAuth.get(`contest/${contestId}/qna/${qnaId}`)
  const userInfoRes = await fetcherWithAuth.get('user')
  const MyContestRolesRes = await fetcherWithAuth.get('contest/role')

  if (!QnaRes.ok || !userInfoRes.ok || !MyContestRolesRes.ok) {
    let errorRes: { message: string; statusCode: number }
    if (!QnaRes.ok) {
      errorRes = await QnaRes.json()
    } else if (!userInfoRes.ok) {
      errorRes = await userInfoRes.json()
      // 로그인하지 않았고, onGoing이지 않은 대회의 경우
      if (errorRes.statusCode === 401 && notOngoing) {
        const QnaData: GetContestQnaQuery['getContestQnA'] = await QnaRes.json()
        const ContestProblems = await fetcherWithAuth
          .get(`contest/${contestId}/problem`)
          .json<{ data: { order: number; id: number; title: string }[] }>()
        const matchedProblem = ContestProblems.data.find(
          ({ id }) => id === QnaData.problemId
        )
        const categoryName = matchedProblem
          ? `${String.fromCharCode(65 + matchedProblem.order)}. ${matchedProblem.title}`
          : QnaData.category

        return (
          <div className="mb-[120px] mt-[80px] flex w-screen max-w-[1440px] flex-col gap-5 gap-[50px] px-[116px] leading-[150%] tracking-[-3%]">
            <QnaContentArea
              QnaData={QnaData}
              categoryName={categoryName}
              DeleteButtonComponent={undefined}
            />
            <QnaCommentArea
              QnaData={QnaData}
              username={''}
              userId={-1}
              isContestStaff={false}
              canPostComment={false}
            />
          </div>
        )
      }
    } else {
      errorRes = await MyContestRolesRes.json()
    }
    return <ErrorPage errorRes={errorRes} />
  }
  const QnaData: GetContestQnaQuery['getContestQnA'] = await QnaRes.json()
  const userInfo: { username?: string; email?: string } =
    await userInfoRes.json()
  const MyContestRoles: ContestRole[] = await MyContestRolesRes.json()

  const res = await fetcherWithAuth.get('user/email', {
    searchParams: { email: userInfo?.email || '' }
  })
  if (!res.ok) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <h1 className="text-2xl font-bold">Error in fetching user ID</h1>
      </div>
    )
  }
  const userInfoByEmail: { id: number } = await res.json()
  const userId = userInfoByEmail.id

  // Define authority
  const isContestStaff = new Set(['Admin', 'Manager']).has(
    MyContestRoles.find(
      (ContestRole) => ContestRole.contestId === Number(contestId)
    )?.role ?? 'nothing'
  )
  const canDeleteQna = isContestStaff || userId === QnaData.createdById
  const canPostComment =
    isContestStaff || userId === QnaData.createdById || notOngoing
  const deleteQnaUrl = `contest/${contestId}/qna/${qnaId}`

  const ContestProblems = await fetcherWithAuth
    .get(`contest/${contestId}/problem`)
    .json<{ data: { order: number; id: number; title: string }[] }>()
  const matchedProblem = ContestProblems.data?.find(
    ({ id }) => id === QnaData.problemId
  )
  const categoryName = matchedProblem
    ? `${String.fromCharCode(65 + matchedProblem.order)}. ${matchedProblem.title}`
    : QnaData.category

  const QnaDeleteTrigger = (
    <Button
      variant="outline"
      className="border-primary hover:bg-color-blue-90 cursor-pointer rounded-sm border-[1px]"
      asChild
    >
      <div className="text-primary flex h-auto items-center justify-center gap-[4px] px-[10px] py-[6px]">
        <HiTrash fontSize={20} />
        <p className="text-sm font-medium tracking-[-3%]">Delete</p>
      </div>
    </Button>
  )

  return (
    <div className="mb-[120px] mt-[80px] flex w-screen max-w-[1440px] flex-col gap-5 gap-[50px] px-[116px] leading-[150%] tracking-[-3%]">
      <QnaContentArea
        QnaData={QnaData}
        categoryName={categoryName}
        DeleteButtonComponent={
          canDeleteQna ? (
            <QnaDetailDeleteButton
              subject="question"
              DeleteUrl={deleteQnaUrl}
              trigger={QnaDeleteTrigger}
            />
          ) : undefined
        }
      />
      <QnaCommentArea
        QnaData={QnaData}
        username={userInfo.username}
        userId={userId}
        isContestStaff={isContestStaff}
        canPostComment={canPostComment}
      />
    </div>
  )
}
