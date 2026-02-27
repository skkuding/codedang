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
import { useEffect } from 'react'
import { toast } from 'sonner'

interface DateTimePickerContestProps {
  onChange: (date: Date) => void
  isContestOngoing?: boolean
  defaultValue?: Date
  defaultTimeOnSelect?: { hours: number; minutes: number; seconds: number }
  originalEndTime?: Date // Add originalEndTime for validation
  date: Date | undefined
  setDate: (date: Date | undefined) => void
}

/**
 * DateTimePickerContest 컴포넌트는 ongoing contest의 edit 페이지에 맞춰 제작된
 * shadcn의 date-time-picker-demo 파일을 기반으로 새롭게 구현되었습니다.
 *
 * @description
 * - ongoing contest의 경우, 새로운 종료 시간이 원래 종료 시간보다 이전일 수 없도록 유효성 검사를 수행합니다.
 */
export function DateTimePickerContest({
  onChange,
  isContestOngoing = false,
  defaultValue,
  defaultTimeOnSelect,
  originalEndTime,
  date,
  setDate
}: DateTimePickerContestProps) {
  useEffect(() => {
    if (defaultValue) {
      setDate(defaultValue)
      onChange(defaultValue)
    }
  }, [])

  const { t } = useTranslate()

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      return
    }
    const newDate = new Date(
      selectedDate.setHours(
        defaultTimeOnSelect?.hours ?? 0,
        defaultTimeOnSelect?.minutes ?? 0,
        defaultTimeOnSelect?.seconds ?? 0
      )
    )

    // ongoing contest인 경우, 새로운 날짜가 원래 종료 시간보다 이전일 경우 날짜 설정을 방지합니다.
    if (isContestOngoing && originalEndTime && newDate < originalEndTime) {
      toast.error(t('end_time_warning'))
      return
    }

    setDate(newDate)
    onChange(newDate)
  }

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
            'h-[36px] w-[492px] justify-start text-left font-normal',
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
            <span className="text-[#C4C4C4]">{t('pick_a_date')}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
        />
        <div className="border-border border-t p-3">
          <TimePickerDemo setDate={setDate} date={date} />
        </div>
      </PopoverContent>
    </Popover>
  )
}
