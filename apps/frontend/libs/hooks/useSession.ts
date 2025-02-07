import { SessionContext } from '@/components/auth/AuthProvider'
import { useContext } from 'react'

export const useSession = () => {
  const context = useContext(SessionContext)

  if (context === undefined) {
    throw new Error('useSession should be used within the AuthProvider')
  }

  return context
}
