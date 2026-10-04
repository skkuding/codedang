'use client'

import { languages, levels } from '@/libs/constants'
import { createContext, useMemo, useState, type ReactNode } from 'react'

type GetterSetterTuple<T> = readonly [T, (currentValue: T) => void]

export type Languages = (typeof languages)[number][]
export type Levels = (typeof levels)[number][]

interface FilterContextType {
  language: GetterSetterTuple<Languages>
  level: GetterSetterTuple<Levels>
}

interface FilterProviderProps {
  children: ReactNode
}

export const FilterContext = createContext<FilterContextType | null>(null)

export function FilterProvider({ children }: FilterProviderProps) {
  const [langFilter, setLangFilter] = useState<Languages>([])
  const [levelFilter, setLevelFilter] = useState<Levels>([])

  const value = useMemo(
    (): FilterContextType => ({
      language: [langFilter, setLangFilter],
      level: [levelFilter, setLevelFilter]
    }),
    [langFilter, levelFilter]
  )

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  )
}
