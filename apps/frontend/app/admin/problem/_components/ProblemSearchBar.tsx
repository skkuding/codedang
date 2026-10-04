'use client'

import { SearchInput } from '@/components/shadcn/search-input'
import { useCallback, type ChangeEvent } from 'react'
import { useSearch } from '../_libs/useSearch'

export function ProblemSearchBar() {
  const [search, setSearch] = useSearch()

  const onSearchInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSearch(e.currentTarget.value)
    },
    [setSearch]
  )

  return (
    <div className="flex flex-wrap gap-4">
      <SearchInput
        placeholder="Search"
        sizeVariant="sm"
        value={search}
        onChange={onSearchInputChange}
      />
      {/* <DataTableLangFilter />
      <DataTableLevelFilter /> */}
    </div>
  )
}
