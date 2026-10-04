import { useContext } from 'react'
import { SearchContext } from '../_components/SearchProvider'

export function useSearch() {
  const context = useContext(SearchContext)

  if (!context) {
    throw new Error('useSearch must be used within SearchContext')
  }

  return [context.search, context.setSearch] as const
}
