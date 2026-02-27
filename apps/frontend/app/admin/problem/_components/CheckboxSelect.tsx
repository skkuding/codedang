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
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
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
        <Button variant="filter" className="flex justify-between">
          <div className="flex items-center">
            <IoFilter className="mr-4 h-4 w-4" />
            <p className="text-body4_r_14">{title}</p>
            {selectedValues.length > 0 && (
              <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <div className="space-x-1">
                  {selectedValues.length === options.length ? (
                    <Badge
                      variant="secondary"
                      className="rounded-xs text-body3_r_16 px-1"
                    >
                      All
                    </Badge>
                  ) : (
                    <div className="flex space-x-1">
                      {selectedValues.map((value) => (
                        <Badge
                          key={value}
                          variant="secondary"
                          className="rounded-xs text-body3_r_16 px-1"
                        >
                          {value}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] rounded-xl px-3 py-5">
        <Command>
          <CommandList className="p-0">
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  className="gap-x-2 hover:bg-gray-100/80"
                >
                  <Checkbox
                    className="rounded-sm"
                    checked={selectedValues.includes(option)}
                    onCheckedChange={() => handleCheckboxChange(option)}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <Button
          variant="default"
          className="h-9 w-full"
          onClick={() => {
            const popoverTrigger = document.querySelector('[data-state="open"]')
            if (popoverTrigger) {
              popoverTrigger.dispatchEvent(
                new Event('click', { bubbles: true })
              )
            }
          }}
        >
          Apply
        </Button>
      </PopoverContent>
    </Popover>
  )
}
