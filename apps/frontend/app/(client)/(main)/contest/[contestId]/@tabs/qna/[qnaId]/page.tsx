import { fetcherWithAuth } from '@/libs/utils'
import type { GetContestQnaQuery } from '@generated/graphql'
import { QnaCommentArea } from './_components/QnaCommentArea'
import { QnaContentArea } from './_components/QnaContentArea'
import { QnaDeleteButton } from './_components/QnaDeleteButton'
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
  const QnaRes = await fetcherWithAuth.get(`contest/${contestId}/qna/${qnaId}`)
  const userInfoRes = await fetcherWithAuth.get('user')
  const MyContestRolesRes = await fetcherWithAuth.get('contest/role')

  if (!QnaRes.ok || !userInfoRes.ok || !MyContestRolesRes.ok) {
    let errorRes: { message: string; statusCode: number }
    if (!QnaRes.ok) {
      errorRes = await QnaRes.json()
    } else if (!userInfoRes.ok) {
      errorRes = await userInfoRes.json()
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
  const canDelete = isContestStaff || userId === QnaData.createdById

  // Content Delete handler
  const deleteContentUrl = `contest/${contestId}/qna/${qnaId}`

  return (
    <div className="mb-[120px] mt-[80px] flex w-screen max-w-[1440px] flex-col gap-5 gap-[50px] px-[116px] leading-[150%] tracking-[-3%]">
      <QnaContentArea
        data={QnaData}
        canDelete={canDelete}
        DeleteButtonComponent={
          <QnaDeleteButton subject="question" DeleteUrl={deleteContentUrl} />
        }
      />
      <QnaCommentArea
        data={QnaData}
        userInfo={userInfo}
        userId={userId}
        isContestStaff={isContestStaff}
      />
    </div>
  )
}
