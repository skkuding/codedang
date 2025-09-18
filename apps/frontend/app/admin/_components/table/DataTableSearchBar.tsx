'use client'

import { Input, type InputProps } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
import { IoSearch } from 'react-icons/io5'
import { useDataTable } from './context'

interface SearchBarProps extends Omit<InputProps, 'size'> {
  columndId: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClassMap = {
  sm: 'h-[36px]!',
  md: 'h-[40px]!',
  lg: 'h-[46px]!'
}

/**
 * 어드민 테이블의 검색창 컴포넌트
 * @description 기본 Input 컴포넌트의 props을 상속받습니다.
 * @param columnId
 * 검색 필터를 적용할 컬럼 아이디
 */
export function DataTableSearchBar({
  placeholder,
  className,
  columndId,
  size = 'md',
  ...props
}: SearchBarProps) {
  const { table } = useDataTable()

  const filterValue = table.getColumn(columndId)?.getFilterValue()
  const onChangeValue = (value: string) => {
    table.getColumn(columndId)?.setFilterValue(value)
    table.setPageIndex(0)
  }

  return (
    <div className="relative">
      <IoSearch className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C4C4C4]" />
      <Input
        placeholder={placeholder ?? 'Search'}
        value={typeof filterValue === 'string' ? filterValue : ''}
        onChange={(e) => onChangeValue(e.currentTarget.value)}
        className={cn(
          'bg-transparent pl-8',
          sizeClassMap[size],
          'min-w-[184px] max-w-[580px] lg:w-[390px]',
          className
        )}
        {...props}
      />
    </div>
  )
}
