'use client'

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
import { IoFilter } from 'react-icons/io5'
import type { MyProblemCardItem } from './MyProblem'

export const STATE_FILTER_OPTIONS: MyProblemCardItem['state'][] = [
  'Published',
  'Ready',
  'Draft'
]

interface MyProblemStateFilterProps {
  selectedStates: MyProblemCardItem['state'][]
  onSelectedStatesChange: (states: MyProblemCardItem['state'][]) => void
}

export function MyProblemStateFilter({
  selectedStates,
  onSelectedStatesChange
}: MyProblemStateFilterProps) {
  const selectedValues = new Set(selectedStates)

  const handleFilterSelect = (value: MyProblemCardItem['state']) => {
    const nextSelectedValues = new Set(selectedValues)

    if (nextSelectedValues.has(value)) {
      nextSelectedValues.delete(value)
    } else {
      nextSelectedValues.add(value)
    }

    onSelectedStatesChange(Array.from(nextSelectedValues))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="border-line text-body1_m_16 h-[46px] min-w-28 justify-center rounded-full border px-5 py-[11px] text-black"
        >
          <IoFilter className="text-color-cool-neutral-30 mr-2 h-5 w-5" />
          State
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <div className="flex gap-1">
                {selectedValues.size === STATE_FILTER_OPTIONS.length ? (
                  <Badge
                    variant="secondary"
                    className="rounded-xs px-1 font-normal"
                  >
                    All
                  </Badge>
                ) : (
                  STATE_FILTER_OPTIONS.filter((state) =>
                    selectedValues.has(state)
                  ).map((state) => (
                    <Badge
                      key={state}
                      variant="secondary"
                      className="rounded-xs px-1 font-normal"
                    >
                      {state}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[150px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {STATE_FILTER_OPTIONS.map((state) => (
                <CommandItem
                  key={state}
                  value={state}
                  className="gap-x-2"
                  onSelect={() => handleFilterSelect(state)}
                >
                  <Checkbox checked={selectedValues.has(state)} />
                  {state}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
