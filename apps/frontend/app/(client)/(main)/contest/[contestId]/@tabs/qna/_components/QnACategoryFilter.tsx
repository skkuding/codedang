'use client'

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
import DownArrow from '@/public/icons/arrow-down.svg'
import type { Column } from '@tanstack/react-table'
import Image from 'next/image'
import React, { type ReactNode } from 'react'

export interface QnACategoryFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  options: {
    value: string
    label: ReactNode
  }[]
  resetPageIndex: () => void
}

export function QnACategoryFilter<TData, TValue>({
  column,
  options,
  resetPageIndex
}: QnACategoryFilterProps<TData, TValue>) {
  const selectedValues = getSelectedValues(column?.getFilterValue())

  const showAll =
    selectedValues.size === 0 ||
    (options.length > 0 && selectedValues.size === options.length)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex h-[46px] w-[215px] cursor-default items-center gap-[10px] overflow-hidden rounded-full border border-[#D8D8D8] bg-transparent px-6 hover:bg-transparent"
        >
          <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {showAll ? (
              <span className="ml-[6px] overflow-hidden text-ellipsis whitespace-nowrap text-[16px] font-medium tracking-[-0.48px] text-[#737373]">
                All
              </span>
            ) : (
              <span className="ml-[6px] overflow-hidden text-ellipsis whitespace-nowrap text-[16px] font-medium tracking-[-0.48px] text-[#737373]">
                {options
                  .filter((option) => selectedValues.has(option.value))
                  .map((option) => option.label)
                  .join(', ')}
              </span>
            )}
          </div>

          <div className="-z-1 relative size-[18px]">
            {' '}
            <Image src={DownArrow} alt="Bottom" fill />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="z-0 w-[175px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup className="px-5 py-[14px]">
              {options.map(({ value, label }) => (
                <CommandItem
                  key={value}
                  value={value}
                  onSelect={() => {
                    if (selectedValues.has(value)) {
                      selectedValues.delete(value)
                    } else {
                      selectedValues.add(value)
                    }
                    const selectedValuesArray = Array.from(selectedValues)
                    column?.setFilterValue(
                      selectedValuesArray.length
                        ? selectedValuesArray
                        : undefined
                    )
                    resetPageIndex()
                  }}
                  className="gap-x-[14px] px-0 py-[6px]"
                >
                  <Checkbox
                    className="size-[18px]"
                    checked={selectedValues.has(value)}
                  />
                  <span
                    className={`w-full truncate ${
                      selectedValues.has(value)
                        ? 'text-[#3581FA] [&:hover]:text-[#3581FA]'
                        : ''
                    }`}
                  >
                    {label}
                  </span>
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
