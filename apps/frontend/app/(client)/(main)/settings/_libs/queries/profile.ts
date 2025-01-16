import { useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { fetchUserProfile, updateUserProfile } from '../apis/profile'

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
