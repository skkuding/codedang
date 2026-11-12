import { useContext } from 'react'
import { FilterContext } from '../_components/FilterProvider'

export function useLangFilter() {
  const context = useContext(FilterContext)

  if (!context) {
    throw new Error('useFilter must be used within FilterContext')
  }

  return context.language
}

export function useLevelFilter() {
  const context = useContext(FilterContext)

  if (!context) {
    throw new Error('useFilter must be used within FilterContext')
  }

  return context.level
}
