import { useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { fetchUserProfile, updateUserProfile } from '../apis/settings'

//import type { Profile } from '../apis/settings'

// 쿼리 키 관리

export const useFetchUserProfileSuspense = () => {
  return useSuspenseQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile
  })
}

export const useUpdateUserProfile = () => {
  return useMutation({
    mutationFn: updateUserProfile
  })
}
