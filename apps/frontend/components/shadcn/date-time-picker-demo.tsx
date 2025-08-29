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
import calendarIcon from '@/public/icons/calendar.svg'
import { format } from 'date-fns'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface DateTimePickerDemoProps {
  onChange: (date: Date) => void
  isContest?: boolean
  defaultValue?: Date
  defaultTimeOnSelect?: { hours: number; minutes: number; seconds: number }
}

export const DateTimePickerDemo = ({
  onChange,
  isContest = false,
  defaultValue,
  defaultTimeOnSelect
}: DateTimePickerDemoProps) => {
  const [date, setDate] = useState<Date>()

  useEffect(() => {
    if (defaultValue) {
      setDate(defaultValue)
      onChange(defaultValue)
    }
  }, [])

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
            'h-[36px] justify-start text-left font-normal',
            isContest ? 'w-[492px]' : 'w-[280px]',
            !date && 'text-muted-foreground'
          )}
        >
          <Image
            className="mr-2 h-4 w-4"
            style={{ filter: 'grayscale(100%)' }}
            src={calendarIcon}
            alt="calendar"
            width={16}
            height={16}
          />

          {date ? (
            format(date, 'PPP HH:mm:ss')
          ) : (
            <span className="text-[#C4C4C4]">Pick a date</span>
          )}
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
