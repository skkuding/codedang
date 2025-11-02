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

  // Problem create 페이지 등에서 사용하기 위해 엄격 모드 해제
  if (!context) {
    return {
      isSampleUploadedByZip: false,
      isHiddenUploadedByZip: false,
      setIsSampleUploadedByZip: () => {},
      setIsHiddenUploadedByZip: () => {}
    }
  }

  return context
}

// 엄격 모드 (에러 발생)
export function useEditProblemContextStrict() {
  const context = useContext(EditProblemContext)
  if (!context) {
    throw new Error(
      'useEditProblemContext must be used within EditProblemProvider'
    )
  }
  return context
}
