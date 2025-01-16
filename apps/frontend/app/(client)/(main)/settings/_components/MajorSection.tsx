import { Button } from '@/components/shadcn/button'
import {
  Command,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty
} from '@/components/shadcn/command'
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/shadcn/popover'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { majors } from '@/libs/constants'
import { cn } from '@/libs/utils'
import React from 'react'
import { FaChevronDown, FaCheck } from 'react-icons/fa6'
import { useSettingsContext } from './context'

export function MajorSection() {
  const {
    isLoading,
    updateNow,
    majorState: { majorOpen, setMajorOpen, majorValue, setMajorValue },
    defaultProfileValues
  } = useSettingsContext()

  const getMajorDisplayValue = () => {
    if (updateNow) {
      return majorValue === 'none'
        ? 'Department Information Unavailable / 학과 정보 없음'
        : majorValue
    }

    return majorValue || defaultProfileValues.major
  }

  return (
    <>
      <label className="-mb-4 mt-2 text-xs">First Major</label>
      <div className="flex flex-col gap-1">
        <Popover open={majorOpen} onOpenChange={setMajorOpen} modal={true}>
          <PopoverTrigger asChild>
            <Button
              aria-expanded={majorOpen}
              variant="outline"
              role="combobox"
              className={cn(
                'justify-between border-gray-200 font-normal text-neutral-600 hover:bg-white',
                (() => {
                  if (updateNow) {
                    return majorValue === 'none' || isLoading
                      ? 'border-red-500 text-neutral-400'
                      : 'border-primary'
                  }
                  return majorValue === defaultProfileValues.major
                    ? 'text-neutral-400'
                    : 'border-primary'
                })()
              )}
            >
              {isLoading ? 'Loading...' : getMajorDisplayValue()}
              <FaChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[555px] p-0">
            <Command>
              <CommandInput placeholder="Search major..." />
              <ScrollArea>
                <CommandEmpty>No major found.</CommandEmpty>
                <CommandGroup>
                  <CommandList className="h-40">
                    {majors?.map((major) => (
                      <CommandItem
                        key={major}
                        value={major}
                        onSelect={(currentValue) => {
                          setMajorValue(currentValue)
                          setMajorOpen(false)
                        }}
                      >
                        <FaCheck
                          className={cn(
                            'mr-2 h-4 w-4',
                            majorValue === major ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {major}
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </ScrollArea>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </>
  )
}
