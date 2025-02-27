import { ErrorMessage } from '@/app/admin/_components/ErrorMessage'
import { Button } from '@/components/shadcn/button'
import { Command, CommandList, CommandItem } from '@/components/shadcn/command'
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/shadcn/popover'
import { useState } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import { FaChevronDown } from 'react-icons/fa6'

const weeks = Array.from({ length: 16 }, (_, i) => i + 1)

export function WeekComboBox({ name }: { name: string }) {
  const {
    control,
    formState: { errors }
  } = useFormContext()

  const { field } = useController({
    name,
    control
  })

  const [selectedWeek, setSelectedWeek] = useState(field.value)
  const [open, setOpen] = useState(false)

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">
            {selectedWeek ? `Week ${selectedWeek}` : 'Select a week'}
            <FaChevronDown className="ml-4 h-3 w-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-0">
          <Command>
            <CommandList>
              {weeks.map((week) => (
                <CommandItem
                  key={week}
                  onSelect={() => {
                    field.onChange(week)
                    setSelectedWeek(week)
                    setOpen(false)
                  }}
                >
                  {`Week ${week}`}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {errors[name] && <ErrorMessage />}
    </div>
  )
}
