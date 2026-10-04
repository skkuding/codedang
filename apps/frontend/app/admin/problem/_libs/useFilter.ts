import { useContext } from 'react'
import { FilterContext } from '../_components/FilterProvider'

export function useFilter() {
  const context = useContext(FilterContext)

  if (!context) {
    throw new Error('useFilter must be used within FilterContext')
  }

  return context
}
