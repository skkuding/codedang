import { fetcherWithAuth } from '@/libs/utils'
import { CommentArea } from './_components/CommentArea'
import { QnaContentArea } from './_components/QnaContentArea'

type PageProps = {
  params: Promise<{
    contestId: string
    order: string
  }>
}
export interface QnaContent {
  id: number
  order: number
  createdById: number
  createdBy: User
  contestId: number
  title: string
  content: string
  category: string
  createTime: Date
}

export interface Qna extends QnaContent {
  comments?: ContestQnAComment[]
}

export interface ContestQnAComment {
  content: string
  createdById: number
  createdBy: User
  createdTime: Date
  isContestStaff: boolean
  order: number
}

interface User {
  username: string
}

export interface GetCurrentUser {
  username: string
  email: string
}

interface ContestRole {
  contestId: number
  role: Role
}

type Role = 'Admin' | 'Manager' | 'Participant' | 'Reviewer'

export default async function QnaDetailPage({ params }: PageProps) {
  const { contestId, order } = await params
  const QnaRes = await fetcherWithAuth.get(`contest/${contestId}/qna/${order}`)
  const userInfoRes = await fetcherWithAuth.get('user')
  const MyContestRolesRes = await fetcherWithAuth.get('contest/role')

  if (!QnaRes.ok || !userInfoRes.ok || !MyContestRolesRes.ok) {
    let errorMessage = ''
    if (!QnaRes.ok) {
      const errorRes: { message: string; statusCode: number } =
        await QnaRes.json()
      errorMessage = errorRes.message
    } else if (!userInfoRes.ok) {
      const errorRes: { message: string; statusCode: number } =
        await userInfoRes.json()
      errorMessage = errorRes.message
    } else {
      const errorRes: { message: string; statusCode: number } =
        await MyContestRolesRes.json()
      errorMessage = errorRes.message
    }
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">{errorMessage}</h1>
        <span className="text-sm text-gray-500">
          {`Error Code: ${QnaRes.status} - ${userInfoRes.status} - ${MyContestRolesRes.status}`}
        </span>
      </div>
    )
  }

  const QnaData: Qna = await QnaRes.json()
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

  const isContestStaff = new Set(['Admin', 'Manager']).has(
    MyContestRoles.find(
      (ContestRole) => ContestRole.contestId === QnaData.contestId
    )?.role ?? 'nothing'
  )
  const canDelete = isContestStaff || userId === QnaData.createdById

  return (
    <div className="mb-[120px] mt-[80px] flex w-screen max-w-[1440px] flex-col gap-5 gap-[50px] px-[116px] leading-[150%] tracking-[-3%]">
      <QnaContentArea data={QnaData} className={''} canDelete={canDelete} />
      <CommentArea
        data={QnaData}
        userInfo={userInfo}
        userId={userId}
        isContestStaff={isContestStaff}
      />
    </div>
  )
}
