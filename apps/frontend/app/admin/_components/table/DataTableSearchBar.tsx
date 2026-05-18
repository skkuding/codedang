'use client'

import type { InputProps } from '@/components/shadcn/input'
import { SearchInput } from '@/components/shadcn/search-input'
import { useDataTable } from './context'

interface DataTableSearchBarProps {
  columndId: string
  placeholder?: string
  containerClassName?: string
  className?: string
  sizeVariant?: InputProps['sizeVariant']
}

export function DataTableSearchBar({
  columndId,
  placeholder = 'Search',
  containerClassName,
  className,
  sizeVariant = 'md'
}: DataTableSearchBarProps) {
  const { table } = useDataTable()

  const filterValue = table.getColumn(columndId)?.getFilterValue()
  const value = typeof filterValue === 'string' ? filterValue : ''

  return (
    <SearchInput
      placeholder={placeholder}
      sizeVariant={sizeVariant}
      containerClassName={containerClassName}
      className={className}
      value={value}
      onChange={(e) => {
        table.getColumn(columndId)?.setFilterValue(e.currentTarget.value)
        table.setPageIndex(0)
      }}
    />
  )
}
