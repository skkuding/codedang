import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import type { Column } from '@tanstack/react-table'
import { IoFilter } from 'react-icons/io5'

interface Option {
  label: string
  value: string
  icon: JSX.Element
}

interface DataTableResultFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: Option[]
}

export default function DataTableResultFilter<TData, TValue>({
  column,
  title,
  options
}: DataTableResultFilterProps<TData, TValue>) {
  const selectedValues = new Set(column?.getFilterValue() as string)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={'sm'}
          className="h-10 border-[1px] border-neutral-200 text-black hover:bg-gray-50"
        >
          <IoFilter className="mr-2 h-4 w-4 text-neutral-600" />
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

      <PopoverContent className="w-[140px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>No Result found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  className="gap-x-2"
                >
                  <Checkbox
                    checked={selectedValues.has(option.value)}
                    onCheckedChange={() => {
                      if (selectedValues.has(option.value)) {
                        selectedValues.delete(option.value)
                      } else {
                        selectedValues.add(option.value)
                      }
                      const filterValues = Array.from(selectedValues)
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined
                      )
                    }}
                  />
                  <span className="flex items-center gap-x-1">
                    {option.label}
                    {option.icon}
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
