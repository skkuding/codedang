import { CommentArea } from './_components/CommentArea'
import { QnaContentArea } from './_components/QnaContentArea'

interface QnaDetailProps {
  params: {
    contestId: string
    order: string
  }
}
// get으로 가져오는 정보
// type ContestQnA {
//   _count: ContestQnACount!
//   category: QnACategory!
//   comments: [ContestQnAComment!]
//   content: String!
//   contest: Contest!
//   contestId: Int!
//   createTime: DateTime!
//   createdBy: User
//   createdById: Int
//   id: ID!
//   isResolved: Boolean!
//   isVisible: Boolean!
//   order: Int!
//   problem: Problem
//   problemId: Int
//   title: String!
// }

export interface QnaContent {
  id: number
  order: number
  createdBy: User
  contestId: number
  title: string
  content: string
  problemId?: number
  category: string
  isResolved: boolean
  createTime: Date
}

export interface Qna extends QnaContent {
  comments: ContestQnAComment[]
}

export interface ContestQnAComment {
  content: string
  createdBy: User
  createdTime: Date
  isContestStaff: boolean
  order: number
}

interface User {
  id: number
  username: string
}

interface UserProfile {
  user?: User
  userId: number
}

interface GetUserbyEmail {
  username: string
  id: number
  userProfile?: UserProfile
}

export interface GetCurrentUser {
  username: string
  email: string
}

interface ContestRole {
  contestId: number
  role: Role
}

type GetContestRoles = ContestRole[]

type Role = 'Admin' | 'Manager' | 'Participant' | 'Reviewer'

export default function QnaDetailPage({ params }: QnaDetailProps) {
  // const { contestId, order } = params
  // const data: ContestQnA = await fetcherWithAuth
  //   .get(`contest/${contestId}/qna/${order}`)
  //   .json()

  // 질문 삭제 버튼 로직: 대회 관리자인지 여부 확인 -no-> 질문 작성자인지 확인 -no-> 일반 유저.
  // 답글 삭제 버튼 로직:
  // TODO: contest/${contestId}/qna/${order}: qna에 대한 정보 가져오기
  const dummyAuthor: User = { id: 1, username: 'skkudinguser' }
  const dummyUser1: User = { id: 2, username: 'admin1234' }
  // contest/${contestId}/qna/${order}로 가져온 정보 예시
  const data: Qna = {
    id: 1,
    content: `삐딱하게 단소 악보
      비딱하게 단소 악보 한글로 알려주세요.
      내공100드림
      딱하게 단소 악보
      비딱하게 단소 악보 한글로 알려주세요.
      내공100드림
      내공100드림
      내공100드림`,
    createTime: new Date('2024-05-01 00:00:00'),
    createdBy: dummyAuthor,
    contestId: 20,
    category: '말머리',
    isResolved: false,
    order: 1,
    title:
      '오버뷰와 달리 Semibold임. 제목은 한줄까지만 제한하는거 어떤가요? 60자 제한 어떤가요 60자가 넘으면은,,,,,,,',
    comments: [
      {
        content: `황황황황 황황황황 황황황태 황황태
영원한건 절대없어 결국에넌 변했지`,
        createdBy: dummyUser1,
        createdTime: new Date('2024-05-03 00:00:00'),
        isContestStaff: true,
        order: 1
      },
      {
        content: `황황황황 황황황황 황황황태 황황태
영원한건 절대없어 결국에넌 변했지`,
        createdBy: dummyAuthor,
        createdTime: new Date('2024-05-05 02:00:00'),
        isContestStaff: false,
        order: 2
      }
    ]
  }

  // TODO: /contest/role: 현재 로그인된 계정의 각 대회 별 권한 가져오기 -> 현재 대회의 권한 확인
  const GetContestRoles: GetContestRoles = [
    {
      contestId: 1,
      role: 'Participant'
    },
    {
      contestId: 20,
      role: 'Participant'
    }
  ]
  // TODO: /user: 현재 로그인된 계정의 정보 가져오기 -> /user/email?email=user02@example.com: 해당 이메일의 유저id 가져오기 -> 작성자 여부 확인.
  const GetCurUserInfo: GetCurrentUser = {
    username: 'skkudinguser',
    email: 'skkudinguser@skku.com'
  }
  // 위에서 얻은 이메일로 현재 로그인 중인 유저 id 가져옴.
  const curUserId = 1

  // 현재 유저가 현재 contest의 관리자인지 판별
  const isContestStaff: boolean = new Set(['Admin', 'Manager']).has(
    GetContestRoles.find(
      (ContestRole) => ContestRole.contestId === data.contestId
    )?.role ?? 'nothing'
  )
  // 아니라면 현재 유저가 작성자인지 판별
  let isCreator = false
  if (!isContestStaff) {
    if (curUserId === data.createdBy.id) {
      isCreator = true
    }
  }

  return (
    <div className="mb-[120px] mt-[80px] flex w-screen max-w-[1440px] flex-col gap-5 gap-[50px] px-[116px] leading-[150%] tracking-[-3%]">
      <QnaContentArea
        data={data}
        className={''}
        canDelete={isCreator || isContestStaff}
      />
      <CommentArea
        data={data}
        curUser={GetCurUserInfo}
        curUserId={curUserId}
        isContestStaff={isContestStaff}
      />
    </div>
  )
}
