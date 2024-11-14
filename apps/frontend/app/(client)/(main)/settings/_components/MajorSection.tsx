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
import { majors } from '@/lib/constants'
import { cn } from '@/lib/utils'
import React from 'react'
import { FaChevronDown, FaCheck } from 'react-icons/fa6'

interface MajorSectionProps {
  majorOpen: boolean
  setMajorOpen: React.Dispatch<React.SetStateAction<boolean>>
  majorValue: string
  setMajorValue: React.Dispatch<React.SetStateAction<string>>
  updateNow: boolean
  isLoading: boolean
  defaultProfileValues: {
    major?: string
  }
}

export default function MajorSection({
  majorOpen,
  setMajorOpen,
  majorValue,
  setMajorValue,
  updateNow,
  isLoading,
  defaultProfileValues
}: MajorSectionProps) {
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
                updateNow
                  ? `${majorValue === 'none' || isLoading ? 'border-red-500 text-neutral-400' : 'border-primary'}`
                  : majorValue === defaultProfileValues.major
                    ? 'text-neutral-400'
                    : 'border-primary'
              )}
            >
              {isLoading
                ? 'Loading...'
                : updateNow
                  ? majorValue === 'none'
                    ? 'Department Information Unavailable / 학과 정보 없음'
                    : majorValue
                  : !majorValue
                    ? defaultProfileValues.major
                    : majorValue}
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
