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

interface DateTimePickerDemoProps {
  onChange: (date: Date) => void
  defaultValue?: Date
  defaultTimeOnSelect?: { hours: number; minutes: number; seconds: number }
}

export const DateTimePickerDemo = ({
  onChange,
  defaultValue,
  defaultTimeOnSelect
}: DateTimePickerDemoProps) => {
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
          onSelect={(date) =>
            setDate(
              new Date(
                date?.setHours(
                  defaultTimeOnSelect?.hours ?? 0,
                  defaultTimeOnSelect?.minutes ?? 0,
                  defaultTimeOnSelect?.seconds ?? 0
                ) ?? new Date(new Date().setHours(0, 0, 0))
              )
            )
          }
          initialFocus
        />
        <div className="border-border border-t p-3">
          <TimePickerDemo setDate={setDate} date={date} />
        </div>
      </PopoverContent>
    </Popover>
  )
}
