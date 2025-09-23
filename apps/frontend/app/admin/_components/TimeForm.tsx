import { DateTimePickerDemo } from '@/components/shadcn/date-time-picker-demo'
import { useController, useFormContext } from 'react-hook-form'
import { ErrorMessage } from './ErrorMessage'

interface TimeFormProps {
  name: string
  isContest?: boolean
  defaultValue?: Date
  defaultTimeOnSelect?: { hours: number; minutes: number; seconds: number }
}

export function TimeForm({
  name,
  isContest = false,
  defaultValue,
  defaultTimeOnSelect
}: TimeFormProps) {
  const {
    control,
    formState: { errors }
  } = useFormContext()

  const { field } = useController({
    name,
    control
  })

  return (
    <div>
      <DateTimePickerDemo
        onChange={field.onChange}
        defaultValue={defaultValue ?? field.value}
        defaultTimeOnSelect={defaultTimeOnSelect}
        isContest={isContest}
      />
      {errors[name] && <ErrorMessage />}
    </div>
  )
}
