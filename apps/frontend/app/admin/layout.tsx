import { Separator } from '@/components/shadcn/separator'
import { auth } from '@/libs/auth'
import { safeFetcherWithAuth } from '@/libs/utils'
import type { Course } from '@/types/type'
import { ContestRole, type User, type UserContest } from '@generated/graphql'
import { redirect } from 'next/navigation'
import { ClientApolloProvider } from './_components/ApolloProvider'
import { ManagementSidebar } from './_components/ManagementSidebar'

// API calls depend on session, so this layout must be dynamic
export const dynamic = 'force-dynamic'

async function fetchGroupLeaderRole() {
  try {
    const response: Course[] = await safeFetcherWithAuth
      .get('course/joined')
      .json()

    return response.some((course) => course.isGroupLeader)
  } catch (error) {
    console.error('Error fetching group leader role:', error)
  }
}

async function fetchContestRoles() {
  try {
    const response: UserContest[] = await safeFetcherWithAuth
      .get('contest/role')
      .json()

    return response.some((userContest) => {
      return (
        userContest.role !== ContestRole.Participant &&
        userContest.role !== ContestRole.Reviewer
      )
    })
  } catch (error) {
    console.error('Error fetching contest roles:', error)
  }
}

async function fetchUserPermissions() {
  try {
    const response = await safeFetcherWithAuth.get<User>('user')
    return response.json()
  } catch (error) {
    console.error('Error fetching user permissions:', error)
  }
}

export default async function Layout({
  children
}: {
  children: React.ReactNode
}) {
  const [hasAnyGroupLeaderRole, hasAnyPermissionOnContest, session, user] =
    await Promise.all([
      fetchGroupLeaderRole(),
      fetchContestRoles(),
      auth(),
      fetchUserPermissions()
    ])
  if (
    !hasAnyGroupLeaderRole &&
    !hasAnyPermissionOnContest &&
    session?.user.role === 'User' &&
    !user?.canCreateContest &&
    !user?.canCreateCourse
  ) {
    redirect('/')
  }

  return (
    <ClientApolloProvider session={session}>
      <div className="flex h-dvh bg-white">
        <nav className="bg-white p-2 pb-6 text-sm font-medium">
          {/* Todo: Group 기능 추가 시, Public Button 대신 GroupSelect 컴포넌트로 변경 */}
          {/* <GroupSelect /> */}
          {/* <Link href="/" className="ml-6">
            <Image
              src={codedangLogo}
              alt="코드당"
              width={135.252}
              height={28}
            />
          </Link>
          <Separator className="my-4 transition" /> */}
          {/* <GroupAdminSideBar /> */}
          {/* <SideBar /> */}
          {/*TODO: role이 groupAdmin인지 확인하고 아니면 그냥 SideBar를 보여주도록 할 예정 */}
          {/* <Link
            href={'/' as Route}
            className="mt-auto rounded-xs px-4 py-2 text-slate-600 transition hover:bg-slate-100"
          >
            <FaArrowRightFromBracket className="mr-2 inline-block" />
            Quit
          </Link> */}
          <ManagementSidebar session={session} />
        </nav>
        <Separator orientation="vertical" />
        {/*NOTE: full width - sidebar width */}
        <div className="relative w-[calc(100%-15rem)] flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </ClientApolloProvider>
  )
}
