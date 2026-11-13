'use client'

import { createContext, useMemo, useState, type ReactNode } from 'react'

interface SearchContextType {
  search: string
  setSearch: (v: string) => void
}

interface SearchProviderProps {
  children: ReactNode
}

export const SearchContext = createContext<SearchContextType | null>(null)

export function SearchProvider({ children }: SearchProviderProps) {
  const [search, setSearch] = useState('')

  const value = useMemo(
    () => ({
      search,
      setSearch
    }),
    [search]
  )

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  )
}
