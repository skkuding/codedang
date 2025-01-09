import { Badge } from '@/components/shadcn/badge'
import { Button } from '@/components/shadcn/button'
import { Checkbox } from '@/components/shadcn/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/shadcn/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import { Separator } from '@/components/shadcn/separator'
import type { Column } from '@tanstack/react-table'
import type { ReactNode } from 'react'
import { IoFilter } from 'react-icons/io5'
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
  const selectedValues = getSelectedValues(column?.getFilterValue())

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={'sm'}
          className="h-10 border hover:bg-gray-50"
        >
          <IoFilter className="mr-2 h-4 w-4" />
          <p className="font-bold">{title}</p>
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <div className="space-x-1">
                {selectedValues.size === options.length ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    All
                  </Badge>
                ) : (
                  <div className="flex space-x-1">
                    {options
                      .filter((option) => selectedValues.has(option.value))
                      .map((option) => (
                        <Badge
                          key={option.value}
                          variant="secondary"
                          className="rounded-sm px-1 font-normal"
                        >
                          {option.label}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[115px] p-0" align="start">
        <Command>
          <CommandList>
            {emptyMessage && <CommandEmpty>{emptyMessage}</CommandEmpty>}
            <CommandGroup>
              {options.map(({ value, label }) => (
                <CommandItem
                  key={value}
                  value={value}
                  className="gap-x-2"
                  onSelect={() => {
                    if (selectedValues.has(value)) {
                      selectedValues.delete(value)
                    } else {
                      selectedValues.add(value)
                    }
                    const filterValues = Array.from(selectedValues)
                    column?.setFilterValue(
                      filterValues.length ? filterValues : undefined
                    )
                    table.resetPageIndex()
                  }}
                >
                  <Checkbox checked={selectedValues.has(value)} />
                  {label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const getSelectedValues = (data: unknown): Set<string> => {
  if (!Array.isArray(data)) return new Set()
  if (data.every((item) => typeof item === 'string')) return new Set(data)
  return new Set()
}
