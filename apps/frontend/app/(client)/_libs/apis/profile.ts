import { safeFetcherWithAuth } from '@/libs/utils'

export interface Profile {
  username: string // ID
  userProfile: {
    realName: string
  }
  studentId: string
  major: string
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
