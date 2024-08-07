'use client'

import { TimePickerDemo } from '@/components/time-picker-demo'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import * as React from 'react'

export function DateTimePickerDemo({
  onChange,
  defaultValue
}: {
  onChange: (date: Date) => void
  defaultValue?: Date
}) {
  const [date, setDate] = React.useState<Date>()

  React.useEffect(() => {
    if (defaultValue) {
      setDate(defaultValue)
    }
  }, [defaultValue])

  return (
    <Popover onOpenChange={() => onChange(date!)}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-[280px] justify-start border-gray-300 text-left font-normal',
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
