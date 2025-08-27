'use client'

import { createContext, useContext, useState } from 'react'

interface HeaderTitleContextType {
  headerTitle: string | null
  setHeaderTitle: (title: string | null) => void
}

const HeaderTitleContext = createContext<HeaderTitleContextType>({
  headerTitle: null,
  setHeaderTitle: () => {}
})

export function HeaderTitleProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [headerTitle, setHeaderTitle] = useState<string | null>(null)

  return (
    <HeaderTitleContext.Provider value={{ headerTitle, setHeaderTitle }}>
      {children}
    </HeaderTitleContext.Provider>
  )
}

export function useHeaderTitle() {
  return useContext(HeaderTitleContext)
}
