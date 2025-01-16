import type { SettingsFormat } from '@/types/type'
import { createContext, useContext } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

export interface Profile {
  username: string // ID
  userProfile: {
    realName: string
  }
  studentId: string
  major: string
}

interface PasswordState {
  passwordShow: boolean
  setPasswordShow: React.Dispatch<React.SetStateAction<boolean>>
  newPasswordShow: boolean
  setNewPasswordShow: React.Dispatch<React.SetStateAction<boolean>>
  confirmPasswordShow: boolean
  setConfirmPasswordShow: React.Dispatch<React.SetStateAction<boolean>>
}

interface MajorState {
  majorOpen: boolean
  setMajorOpen: React.Dispatch<React.SetStateAction<boolean>>
  majorValue: string
  setMajorValue: React.Dispatch<React.SetStateAction<string>>
}

interface FormState {
  register: UseFormRegister<SettingsFormat>
  errors: FieldErrors<SettingsFormat>
}

export type SettingsContextType = {
  defaultProfileValues: Profile
  passwordState: PasswordState
  majorState: MajorState
  formState: FormState
  updateNow: boolean
  //isLoading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
)
export const SettingsProvider = SettingsContext.Provider

// useSettingsContext custom hook
export const useSettingsContext = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider')
  }
  return context
}
