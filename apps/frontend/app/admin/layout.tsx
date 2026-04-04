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
      <div className="flex h-dvh overflow-hidden bg-white">
        <nav className="shrink-0 bg-white text-sm font-medium">
          <ManagementSidebar session={session} />
        </nav>
        {/*NOTE: full width - sidebar width */}
        <div className="relative flex-1 overflow-y-auto">{children}</div>
      </div>
    </ClientApolloProvider>
  )
}
