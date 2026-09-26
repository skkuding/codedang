import { safeFetcherWithAuth } from '@/libs/utils'
import { ContestRole, type User, type UserContest } from '@generated/graphql'
import { redirect } from 'next/navigation'

// API calls depend on session, so this layout must be dynamic
export const dynamic = 'force-dynamic'

// NOTE: Participant/Reviewer 제외 판정이 app/admin/layout.tsx와
// ManagementSidebar.tsx에도 중복되어 있어 동일하게 유지해야 함
async function canManageContest() {
  try {
    const user = await safeFetcherWithAuth.get('user').json<User>()

    if (user.canCreateContest) {
      return true
    }

    // NOTE: /contest/role은 인증 실패 시 401 대신 200을 반환하므로,
    // 인증이 유효함이 확인된 뒤에 호출해야 함 (병렬 호출 금지)
    const userContests = await safeFetcherWithAuth
      .get('contest/role')
      .json<UserContest[]>()

    return userContests.some(
      ({ role }) =>
        role !== ContestRole.Participant && role !== ContestRole.Reviewer
    )
  } catch (error) {
    console.error('Error fetching contest permission:', error)
    return false
  }
}

export default async function Layout({
  children
}: {
  children: React.ReactNode
}) {
  if (!(await canManageContest())) {
    redirect('/admin')
  }

  return children
}
