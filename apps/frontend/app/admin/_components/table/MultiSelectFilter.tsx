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
import { useState, type ReactNode } from 'react'
import { IoFilter } from 'react-icons/io5'

interface MultiSelectFilterProps {
  title?: string
  options: {
    value: string
    label: ReactNode
  }[]
  emptyMessage?: string
  onUpdate?: (filterValue: string[]) => void
  defaultValue?: string[]
}

export function MultiSelectFilter({
  title,
  options,
  emptyMessage,
  defaultValue = [],
  onUpdate
}: MultiSelectFilterProps) {
  const [selectedValues, setSelectedValues] = useState<Set<string>>(() =>
    getSelectedValues(defaultValue)
  )

  const onSelectItem = (value: string) => {
    const next = new Set(selectedValues)

    if (next.has(value)) {
      next.delete(value)
    } else {
      next.add(value)
    }

    setSelectedValues(next)
    onUpdate?.([...next])
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-[36px]">
          <IoFilter className="mr-2" />
          <p className="text-xs font-normal">{title}</p>
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <div className="space-x-1">
                {selectedValues.size === options.length ? (
                  <Badge
                    variant="secondary"
                    className="rounded-xs px-1 font-normal"
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

      <PopoverContent className="w-[160px] p-0" align="start">
        <Command>
          <CommandList>
            {emptyMessage && <CommandEmpty>{emptyMessage}</CommandEmpty>}
            <CommandGroup>
              {options.map(({ value, label }) => (
                <CommandItem
                  key={value}
                  value={value}
                  className="gap-x-2"
                  onSelect={onSelectItem}
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
