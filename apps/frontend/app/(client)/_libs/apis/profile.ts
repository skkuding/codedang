import { safeFetcherWithAuth } from '@/libs/utils'

export interface Profile {
  username: string // ID
  nickname?: string
  jobType?: string
  userProfile: {
    realName: string
    profileImageUrl?: string
  }
  studentId: string
  college: string
  major: string
  email: string
  userOauth?: { provider: string }[]
}

export const fetchUserProfile = async (): Promise<Profile> => {
  return await safeFetcherWithAuth.get('user').json()
}

export const updateUserProfile = async (
  updatePayload: Partial<Profile & { password?: string; newPassword?: string }>
): Promise<Response> => {
  return await safeFetcherWithAuth.patch('user', {
    json: updatePayload
  })
}
