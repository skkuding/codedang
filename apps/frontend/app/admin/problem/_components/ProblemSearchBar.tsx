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
    <>
      <SearchInput
        placeholder="Search"
        sizeVariant="sm"
        containerClassName="shrink-0 self-start"
        value={search}
        onChange={onSearchInputChange}
      />
      {/* <DataTableLangFilter />
      <DataTableLevelFilter /> */}
    </>
  )
}
