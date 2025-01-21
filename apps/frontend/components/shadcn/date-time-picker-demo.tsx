'use client'

import { Button } from '@/components/shadcn/button'
import { Calendar } from '@/components/shadcn/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import { TimePickerDemo } from '@/components/shadcn/time-picker-demo'
import { cn } from '@/libs/utils'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

export const DateTimePickerDemo = ({
  onChange,
  defaultValue
}: {
  onChange: (date: Date) => void
  defaultValue?: Date
}) => {
  const [date, setDate] = useState<Date>()

  useEffect(() => {
    if (defaultValue) {
      setDate(defaultValue)
    }
  }, [defaultValue])

  return (
    <Popover
      onOpenChange={() => {
        if (date) {
          onChange(date)
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP HH:mm:ss') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
        <div className="border-border border-t p-3">
          <TimePickerDemo setDate={setDate} date={date} />
        </div>
      </PopoverContent>
    </Popover>
  )
}
