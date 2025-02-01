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
import React from 'react'
import { IoFilter } from 'react-icons/io5'

export function ContestTitleFilter() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={'sm'}
          className="h-10 rounded-full border border-neutral-200 px-4 font-semibold text-black hover:bg-gray-50"
        >
          <IoFilter className="mr-2 h-4 w-4" />
          <p className="font-bold">Status</p>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[115px] p-0" align="start">
        <Command>
          <CommandList>
            {/* {emptyMessage && <CommandEmpty>{emptyMessage}</CommandEmpty>} */}
            <CommandGroup>
              <CommandItem
                key={'Ongoing'}
                value={'Ongoing'}
                className="gap-x-2"
                // onSelect={() => {
                //   if (selectedValues.has(value)) {
                //     selectedValues.delete(value)
                //   } else {
                //     selectedValues.add(value)
                //   }
                //   const filterValues = Array.from(selectedValues)
                //   column?.setFilterValue(
                //     filterValues.length ? filterValues : undefined
                //   )
                //   table.resetPageIndex()
                // }}
              >
                <Checkbox />
                Ongoing
              </CommandItem>
              <CommandItem
                key={'Upcoming'}
                value={'Upcoming'}
                className="gap-x-2"
                // onSelect={() => {
                //   if (selectedValues.has(value)) {
                //     selectedValues.delete(value)
                //   } else {
                //     selectedValues.add(value)
                //   }
                //   const filterValues = Array.from(selectedValues)
                //   column?.setFilterValue(
                //     filterValues.length ? filterValues : undefined
                //   )
                //   table.resetPageIndex()
                // }}
              >
                <Checkbox />
                Upcoming
              </CommandItem>
              <CommandItem
                key={'Finished'}
                value={'Finished'}
                className="gap-x-2"
                // onSelect={() => {
                //   if (selectedValues.has(value)) {
                //     selectedValues.delete(value)
                //   } else {
                //     selectedValues.add(value)
                //   }
                //   const filterValues = Array.from(selectedValues)
                //   column?.setFilterValue(
                //     filterValues.length ? filterValues : undefined
                //   )
                //   table.resetPageIndex()
                // }}
              >
                <Checkbox />
                Finished
              </CommandItem>
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
