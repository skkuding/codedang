'use client'

import type { InputProps } from '@/components/shadcn/input'
import { SearchInput } from '@/components/shadcn/search-input'
import { useDataTable } from './context'

interface RealtimeSearchBarProps {
  columndId: string
  placeholder?: string
  containerClassName?: string
  className?: string
  sizeVariant?: InputProps['sizeVariant']
}

export function RealtimeSearchBar({
  columndId,
  placeholder = 'Search',
  containerClassName,
  className,
  sizeVariant = 'md'
}: RealtimeSearchBarProps) {
  const { table } = useDataTable()

  const filterValue = table.getColumn(columndId)?.getFilterValue()
  const value = typeof filterValue === 'string' ? filterValue : ''

  const onChange = (v: string) => {
    table.getColumn(columndId)?.setFilterValue(v)
    table.setPageIndex(0)
  }

  return (
    <SearchInput
      placeholder={placeholder}
      sizeVariant={sizeVariant}
      containerClassName={containerClassName}
      className={className}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
    />
  )
}
