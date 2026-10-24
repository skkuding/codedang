import { safeFetcherWithAuth } from '@/libs/utils'
import { ContestRole, type UserContest } from '@generated/graphql'
import { ContestAccessDenied } from './_components/ContestAccessDenied'

export const dynamic = 'force-dynamic'

async function fetchContestRoles() {
  try {
    const response: UserContest[] = await safeFetcherWithAuth
      .get('contest/role')
      .json()

    return response
  } catch (error) {
    console.error('Error fetching contest roles:', error)
    return []
  }
}

export default async function Layout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ contestId: string }>
}) {
  const { contestId } = await params
  const roles = await fetchContestRoles()

  const hasPermission = roles.some(
    (r) =>
      r.contestId === Number(contestId) &&
      (r.role === ContestRole.Admin || r.role === ContestRole.Manager)
  )

  if (!hasPermission) {
    return <ContestAccessDenied />
  }

  return children
}
