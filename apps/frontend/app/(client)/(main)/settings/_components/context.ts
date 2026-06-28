import { createContext, useContext } from 'react'

export interface Profile {
  username: string // ID
  nickname?: string
  jobType?: string
  email: string
  userProfile: {
    realName: string
    profileImageUrl?: string
  }
  studentId: string
  college: string
  major: string
  userOauth?: { provider: string }[]
}

interface CollegeState {
  collegeValue: string
  setCollegeValue: React.Dispatch<React.SetStateAction<string>>
}

interface MajorState {
  majorValue: string
  setMajorValue: React.Dispatch<React.SetStateAction<string>>
}

export type SettingsContextType = {
  defaultProfileValues: Profile
  collegeState: CollegeState
  majorState: MajorState
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
)
export const SettingsProvider = SettingsContext.Provider

export const useSettingsContext = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider')
  }
  return context
}
