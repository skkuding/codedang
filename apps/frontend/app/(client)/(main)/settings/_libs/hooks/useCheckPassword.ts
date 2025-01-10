import { safeFetcher } from '@/libs/utils'
import { useState } from 'react'
import { toast } from 'sonner'

interface UseCheckPasswordResult {
  isPasswordCorrect: boolean
  newPasswordAble: boolean
  isCheckButtonClicked: boolean
  checkPassword: () => Promise<void>
}

/**
 * Hook that returns whether a new password can be set after verifying the current password
 * @param defaultProfileValues Default profile values
 * @param currentPassword The password currently entered by the user
 */
export const useCheckPassword = (
  defaultProfileValues: { username: string },
  currentPassword: string
): UseCheckPasswordResult => {
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false)
  const [newPasswordAble, setNewPasswordAble] = useState(false)
  const [isCheckButtonClicked, setIsCheckButtonClicked] = useState(false)

  const checkPassword = async () => {
    setIsCheckButtonClicked(true)
    try {
      const response = await safeFetcher.post('auth/login', {
        json: {
          username: defaultProfileValues.username,
          password: currentPassword
        }
      })

      setIsPasswordCorrect(true)
      setNewPasswordAble(true)
    } catch {
      toast.error('Failed to check password')
      console.error('Failed to check password')
    }
  }

  return {
    isPasswordCorrect,
    newPasswordAble,
    isCheckButtonClicked,
    checkPassword
  }
}
