import axios from 'axios'
import { useQuery } from 'vue-query'

interface User {
  username: string
  role: string
  email: string
  lastLogin: string
  updateTime: string
  userProfile: unknown
}

export const useUserQuery = () => {
  return useQuery('user', async () =>
    axios.get<User>('/api/user').then((res) => res.data)
  )
}
