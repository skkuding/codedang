import type { Column } from '@tanstack/react-table'
import { useRef, type ReactNode } from 'react'
import { MultiSelectFilter } from './MultiSelectFilter'
import { useDataTable } from './context'

interface DataTableMultiSelectFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: {
    value: string
    label: ReactNode
  }[]
  emptyMessage?: string
}

/**
 * 어드민 테이블의 다중 선택 필터 컴포넌트
 * @param column
 * 컬럼 정보가 담긴 객체
 * @param title
 * 드롭다운 트리거 버튼에 표시될 텍스트
 * @param options
 * 값과 라벨을 포함한 옵션 목록
 * @param emptyMessage
 * 옵션이 없을 경우 보여줄 텍스트
 */
export function DataTableMultiSelectFilter<TData, TValue>({
  column,
  title,
  options,
  emptyMessage
}: DataTableMultiSelectFilterProps<TData, TValue>) {
  const { table } = useDataTable()

  const defaultFilterToArray = (): string[] => {
    const data = column?.getFilterValue()
    if (!Array.isArray(data)) {
      return []
    }
    if (data.every((item) => typeof item === 'string')) {
      return Array.from(data)
    }
    return []
  }
  const defaultFilterValue = useRef<string[]>(defaultFilterToArray())

  const onUpdate = (filteredValues: string[]) => {
    column?.setFilterValue(filteredValues.length ? filteredValues : undefined)
    table.resetPageIndex()
  }

  return (
    <MultiSelectFilter
      title={title}
      options={options}
      emptyMessage={emptyMessage}
      defaultValue={defaultFilterValue.current}
      onUpdate={onUpdate}
    />
  )
}
