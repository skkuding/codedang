import { Badge } from '@/components/shadcn/badge'
import { Button } from '@/components/shadcn/button'
import { Checkbox } from '@/components/shadcn/checkbox'
import {
  Command,
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
import { useTranslate } from '@tolgee/react'
import React, { type ReactNode } from 'react'
import { IoFilter } from 'react-icons/io5'

interface ContestTableMultiSelectFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: {
    value: string
    label: ReactNode
  }[]
  emptyMessage?: string
  resetPageIndex: () => void
}

export function ContestTitleFilter<TData, TValue>({
  column,
  title,
  options,
  resetPageIndex
}: ContestTableMultiSelectFilterProps<TData, TValue>) {
  const { t } = useTranslate()
  const selectedValues = getSelectedValues(column?.getFilterValue())

  const handleFilterSelect = (value: string) => {
    if (selectedValues.has(value)) {
      selectedValues.delete(value)
    } else {
      selectedValues.add(value)
    }
    const filterValues = Array.from(selectedValues)
    column?.setFilterValue(filterValues.length ? filterValues : undefined)
    resetPageIndex()
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={'sm'}
          className="h-9 rounded-full border border-neutral-200 px-4 font-semibold text-black hover:bg-gray-50"
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
                    className="rounded-xs px-1 font-normal"
                  >
                    {t('all_badge')}
                  </Badge>
                ) : (
                  <div className="flex space-x-1">
                    {options
                      .filter((option) => selectedValues.has(option.value))
                      .map((option) => (
                        <Badge
                          key={option.value}
                          variant="secondary"
                          className="rounded-xs px-1 font-normal"
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
            {/* {emptyMessage && <CommandEmpty>{emptyMessage}</CommandEmpty>} */}
            <CommandGroup>
              {options.map(({ value, label }) => (
                <CommandItem
                  key={value}
                  value={value}
                  className="gap-x-2"
                  onSelect={() => {
                    handleFilterSelect(value)
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
  if (!Array.isArray(data)) {
    return new Set()
  }
  if (data.every((item) => typeof item === 'string')) {
    return new Set(data)
  }
  return new Set()
}
