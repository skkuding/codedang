import { ContestRole, type UserContest } from '@generated/graphql'
import { safeFetcherWithAuth } from './utils'

export const hasContestAdminRole = async () => {
  const userContests = await safeFetcherWithAuth
    .get('contest/role')
    .json<UserContest[]>()

  return userContests.some(
    ({ role }) =>
      role !== ContestRole.Participant && role !== ContestRole.Reviewer
  )
}
