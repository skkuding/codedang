'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface EditProblemContextValue {
  isSampleUploadedByZip: boolean
  isHiddenUploadedByZip: boolean
  setIsSampleUploadedByZip: (value: boolean) => void
  setIsHiddenUploadedByZip: (value: boolean) => void
}

const EditProblemContext = createContext<EditProblemContextValue | null>(null)

export function EditProblemProvider({ children }: { children: ReactNode }) {
  const [isSampleUploadedByZip, setIsSampleUploadedByZip] = useState(false)
  const [isHiddenUploadedByZip, setIsHiddenUploadedByZip] = useState(false)

  return (
    <EditProblemContext.Provider
      value={{
        isSampleUploadedByZip,
        isHiddenUploadedByZip,
        setIsSampleUploadedByZip,
        setIsHiddenUploadedByZip
      }}
    >
      {children}
    </EditProblemContext.Provider>
  )
}

export function useEditProblemContext() {
  const context = useContext(EditProblemContext)
  if (!context) {
    throw new Error(
      'useEditProblemContext must be used within EditProblemProvider'
    )
  }
  return context
}
