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
import { useTranslate } from '@tolgee/react'
import { format } from 'date-fns'
import Image from 'next/image'
import { useEffect, useState, forwardRef } from 'react'

interface DateTimePickerDemoProps {
  onChange: (date: Date) => void
  isContest?: boolean
  defaultValue?: Date
  defaultTimeOnSelect?: { hours: number; minutes: number; seconds: number }
}

export const DateTimePickerDemo = forwardRef<
  HTMLButtonElement,
  DateTimePickerDemoProps
>(({ onChange, isContest = false, defaultValue, defaultTimeOnSelect }, ref) => {
  const [date, setDate] = useState<Date>()
  const { t } = useTranslate()

  useEffect(() => {
    if (defaultValue && defaultValue instanceof Date) {
      handleDateChange(defaultValue)
    }
  }, [defaultValue])

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate && newDate instanceof Date) {
      setDate(newDate)
    }
  }

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open && date) {
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
          ref={ref}
        >
          <Image
            className="mr-2 h-4 w-4"
            style={{ filter: 'grayscale(100%)' }}
            src={calendarIcon}
            alt={t('calendar_icon')}
            width={16}
            height={16}
          />

          {date ? (
            format(date, 'PPP HH:mm:ss')
          ) : (
            <span className="text-[#C4C4C4]">{t('pick_a_date')}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => {
            if (date) {
              const newDate = new Date(
                date.setHours(
                  defaultTimeOnSelect?.hours ?? 0,
                  defaultTimeOnSelect?.minutes ?? 0,
                  defaultTimeOnSelect?.seconds ?? 0
                )
              )
              handleDateChange(newDate)
            }
          }}
          initialFocus
        />
        <div className="border-border border-t p-3">
          <TimePickerDemo
            setDate={(newDate) => {
              if (newDate) {
                handleDateChange(newDate)
              }
            }}
            date={date}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
})

DateTimePickerDemo.displayName = 'DateTimePickerDemo'
