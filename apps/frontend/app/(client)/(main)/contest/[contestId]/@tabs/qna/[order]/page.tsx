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
  id?: number
  order?: number
  createdById?: number
  createdBy?: User
  contestId?: number
  title?: string
  content?: string
  category?: string
  createTime?: Date
}

export interface Qna extends QnaContent {
  comments?: ContestQnAComment[]
}

export interface ContestQnAComment {
  content: string
  createdById: number
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
  // QnA 데이터 가져오기
  const QnaRes = await fetcherWithAuth.get(`contest/${contestId}/qna/${order}`)

  // 현재 로그인된 유저의 정보 가져오기
  const userInfoRes = await fetcherWithAuth.get('user')

  //  현재 로그인된 유저의 대회 권한 가져오기
  const MyContestRolesRes = await fetcherWithAuth.get('contest/role')

  // data 중 하나라도 제대로 받아오지 못했다면 에러 페이지
  if (!QnaRes.ok || !userInfoRes.ok || !MyContestRolesRes.ok) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Error loading QnA</h1>
        <span className="text-sm text-gray-500">
          {`Error Code: ${QnaRes.status} - ${userInfoRes.status} - ${MyContestRolesRes.status}`}
        </span>
      </div>
    )
  }

  // QnA 데이터와 유저 정보, 대회 권한, 유저 ID 가져오기
  const QnaData: Qna = await QnaRes.json()
  const userInfo: { username?: string; email?: string } =
    await userInfoRes.json()
  const MyContestRoles: ContestRole[] = await MyContestRolesRes.json()

  // TODO: delete theses lines
  console.log('QnaData:', QnaData)
  console.log('userInfo:', userInfo)
  console.log('MyContestRoles:', MyContestRoles)

  // 현재 로그인된 유저의 id 가져오기 (userInfo의 이메일을 통해서)
  const res = await fetcherWithAuth.get('user/email', {
    searchParams: { email: userInfo?.email || '' }
  })
  if (!res.ok) {
    console.error('Failed to fetch user ID by email')
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <h1 className="text-2xl font-bold">Error fetching user ID</h1>
      </div>
    )
  }
  const userInfoByEmail: { id: number } = await res.json()
  console.log('userInfoByEmail:', userInfoByEmail)
  const userId: number = userInfoByEmail.id

  // 현재 유저가 현재 contest의 관리자인지 판별
  const isContestStaff: boolean = new Set(['Admin', 'Manager']).has(
    MyContestRoles.find(
      (ContestRole) => ContestRole.contestId === QnaData.contestId
    )?.role ?? 'nothing'
  )
  // 아니라면 현재 유저가 작성자인지 판별
  let isCreator = false
  if (!isContestStaff) {
    if (userId === QnaData.createdById) {
      isCreator = true
    }
  }

  return (
    <div className="mb-[120px] mt-[80px] flex w-screen max-w-[1440px] flex-col gap-5 gap-[50px] px-[116px] leading-[150%] tracking-[-3%]">
      <QnaContentArea
        data={QnaData}
        className={''}
        canDelete={isCreator || isContestStaff}
      />
      <CommentArea
        data={QnaData}
        userInfo={userInfo}
        userId={userId}
        isContestStaff={isContestStaff}
      />
    </div>
  )
}
