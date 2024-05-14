'use client'

import { Button } from '@/components/ui/button'
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
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'

const groups = [
  {
    id: '1',
    label: 'Public'
  },
  {
    id: '2',
    label: '컴퓨팅사고와SW코딩 DASF001'
  },
  {
    id: '3',
    label: '공학컴퓨터프로그래밍 DASF003'
  },
  {
    id: '4',
    label: '프로그래밍기초와실습 DASF004'
  }
]

export default function GroupSelect() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(groups[0].id)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="h-fit justify-between py-2 text-left text-lg font-bold text-slate-800"
        >
          {value
            ? groups.find((framework) => framework.id === value)?.label
            : 'Select group...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mx-2 w-48 p-0 font-semibold">
        <Command>
          <CommandList>
            <CommandEmpty>No group found.</CommandEmpty>
            <CommandGroup>
              {groups.map((framework) => (
                <CommandItem
                  key={framework.id}
                  value={framework.id}
                  className="text-slate-600"
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === framework.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {framework.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
