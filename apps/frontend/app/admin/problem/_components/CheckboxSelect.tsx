'use client'

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
import { useState, useEffect } from 'react'
import { IoFilter } from 'react-icons/io5'

interface DataProps<T> {
  title: string
  options: T[] | readonly T[]
  onChange: (selectedValues: T[]) => void
  defaultValue?: T[]
}

export function CheckboxSelect<T extends string>({
  title,
  options,
  onChange,
  defaultValue
}: DataProps<T>) {
  const [selectedValues, setSelectedValues] = useState<T[]>([])

  useEffect(() => {
    if (defaultValue) {
      setSelectedValues(defaultValue)
    }
  }, [defaultValue])

  const handleCheckboxChange = (option: T) => {
    setSelectedValues((prevSelectedValues) => {
      if (prevSelectedValues.includes(option)) {
        return prevSelectedValues.filter((value) => value !== option)
      } else {
        return [...prevSelectedValues, option]
      }
    })
  }

  return (
    <Popover onOpenChange={() => onChange(selectedValues)}>
      <PopoverTrigger asChild>
        <Button
          variant="filter"
          size={'sm'}
          className="h-10 border px-5 hover:bg-gray-50"
        >
          <IoFilter className="mr-2 h-4 w-4" />
          <p className="font-semibold">{title}</p>
          {selectedValues.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <div className="space-x-1">
                {selectedValues.length === options.length ? (
                  <Badge
                    variant="secondary"
                    className="rounded-xs px-1 font-normal"
                  >
                    All
                  </Badge>
                ) : (
                  <div className="flex space-x-1">
                    {selectedValues.map((value) => (
                      <Badge
                        key={value}
                        variant="secondary"
                        className="rounded-xs px-1 font-normal"
                      >
                        {value}
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
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem key={option} value={option} className="gap-x-2">
                  <Checkbox
                    checked={selectedValues.includes(option)}
                    onCheckedChange={() => handleCheckboxChange(option)}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
