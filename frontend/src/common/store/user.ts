import axios from 'axios'
import { useQuery } from 'vue-query'

type Role = 'User' | 'Manager' | 'Admin' | 'SuperAdmin'

interface User {
  username: string
  role: Role
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
