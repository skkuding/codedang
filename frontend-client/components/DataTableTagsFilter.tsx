'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { PlusCircledIcon } from '@radix-ui/react-icons'
import type { Column } from '@tanstack/react-table'
import * as React from 'react'
import { useState } from 'react'
import { IoClose } from 'react-icons/io5'

interface Tag {
  id: number
  name: string
}

interface DataTableTagsFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: Tag[]
}

export function DataTableTagsFilter<TData, TValue>({
  column,
  title,
  options
}: DataTableTagsFilterProps<TData, TValue>) {
  const selectedValues = new Set(column?.getFilterValue() as number[])
  const [inputValue, setInputValue] = useState('')

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={'sm'}
          className="h-10 border hover:bg-gray-50"
        >
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          <p className="font-bold">{title}</p>
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <div className="space-x-1">
                {selectedValues.size >= 4 ? (
                  <Badge
                    variant={'secondary'}
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  <div className="flex space-x-1">
                    {options
                      .filter((option) => selectedValues.has(option.id))
                      .map((option) => (
                        <Badge
                          variant="secondary"
                          key={option.id}
                          className="rounded-sm px-1 font-normal"
                        >
                          {option.name}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className=" p-0" align="start">
        <Command>
          <CommandInput
            placeholder="search"
            value={inputValue}
            onValueChange={(e) => setInputValue(e)}
          />
          <CommandList>
            <div className="p-2">
              {inputValue === ''
                ? options.map((option) => (
                    <Badge
                      key={option.id}
                      variant="secondary"
                      className={`mr-2 cursor-pointer rounded-lg border-solid px-2 font-normal hover:bg-gray-100/80 active:bg-gray-100/80
                      ${selectedValues.has(option.id) ? 'border-gray-100/80 bg-gray-100/80' : 'border-gray-200/80 bg-white '}
                      `}
                      onClick={() => {
                        if (selectedValues.has(option.id)) {
                          selectedValues.delete(option.id)
                        } else {
                          selectedValues.add(option.id)
                        }
                        const filterValues = Array.from(selectedValues)
                        column?.setFilterValue(
                          filterValues.length ? filterValues : undefined
                        )
                      }}
                    >
                      {option.name}
                      {selectedValues.has(option.id) ? (
                        <IoClose className="ml-2 h-[14px] w-[14px] text-gray-500" />
                      ) : (
                        ''
                      )}
                    </Badge>
                  ))
                : options
                    .filter((option) =>
                      option.name
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    )
                    .map((option) => (
                      <Badge
                        key={option.id}
                        variant="secondary"
                        className={`mr-2 cursor-pointer rounded-lg border-solid px-2 font-normal hover:bg-gray-100/80 active:bg-gray-100/80
                ${selectedValues.has(option.id) ? 'border-gray-100/80 bg-gray-100/80' : 'border-gray-200/80 bg-white '}
              `}
                        onClick={() => {
                          if (selectedValues.has(option.id)) {
                            selectedValues.delete(option.id)
                          } else {
                            selectedValues.add(option.id)
                          }
                          const filterValues = Array.from(selectedValues)
                          column?.setFilterValue(
                            filterValues.length ? filterValues : undefined
                          )
                        }}
                      >
                        {option.name}
                        {selectedValues.has(option.id) ? (
                          <IoClose className="ml-2 h-[14px] w-[14px] text-gray-500" />
                        ) : (
                          ''
                        )}
                      </Badge>
                    ))}
            </div>

            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
