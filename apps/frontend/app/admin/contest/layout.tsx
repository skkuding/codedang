import { hasContestAdminRole } from '@/libs/contestRole'
import { safeFetcherWithAuth } from '@/libs/utils'
import type { User } from '@generated/graphql'
import { redirect } from 'next/navigation'

// API calls depend on session, so this layout must be dynamic
export const dynamic = 'force-dynamic'

async function canManageContest() {
  try {
    const user = await safeFetcherWithAuth.get('user').json<User>()

    if (user.canCreateContest) {
      return true
    }

    return await hasContestAdminRole()
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
