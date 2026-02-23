import { ErrorMessage } from '@/app/admin/_components/ErrorMessage'
import { useTranslate } from '@tolgee/react'
import { useRef, useState } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { DateTimePickerContest } from './date-time-picker-ongoing-contest'

interface ContestEditEndTimeFormProps {
  name: string
  isOngoing?: boolean
  defaultValue?: Date
  defaultTimeOnSelect?: { hours: number; minutes: number; seconds: number }
}

export function ContestEditEndTimeForm({
  name,
  isOngoing = false,
  defaultValue,
  defaultTimeOnSelect
}: ContestEditEndTimeFormProps) {
  const { t } = useTranslate()

  const {
    control,
    formState: { errors },
    setValue,
    watch
  } = useFormContext()

  const { field } = useController({
    name,
    control
  })
  const originalEndTime = useRef(watch(name)).current

  // Ongoing Contest Edit End Time form의 시간 입력 Input을 위한 state
  const [date, setDate] = useState<Date>()

  // Ongoing Contest는 end time을 앞당길 수 없음(연장만 가능)
  const handleTimeChange = (newDate: Date) => {
    if (isOngoing) {
      const newEndTime = new Date(newDate)
      if (originalEndTime && newEndTime < new Date(originalEndTime)) {
        setDate(originalEndTime)
        toast.error(t('ongoing_contest_end_time_error'))
        return
      }
      setValue(name, newDate)
      field.onChange(newDate)
    } else {
      setValue(name, newDate)
      field.onChange(newDate)
    }
  }

  return (
    <div>
      <DateTimePickerContest
        onChange={handleTimeChange}
        defaultValue={defaultValue ?? field.value}
        defaultTimeOnSelect={defaultTimeOnSelect}
        isContestOngoing={isOngoing}
        originalEndTime={originalEndTime}
        date={date}
        setDate={setDate}
      />
      {errors[name] && <ErrorMessage />}
    </div>
  )
}
