import { fetchUserProfile } from '../apis/profile'

export const profileQueries = {
  all: () => ['userProfile'] as const,
  fetch: () => ({
    queryKey: profileQueries.all(),
    queryFn: fetchUserProfile
  })
}
