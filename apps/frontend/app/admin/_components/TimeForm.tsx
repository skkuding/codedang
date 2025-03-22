import { DateTimePickerDemo } from '@/components/shadcn/date-time-picker-demo'
import { useController, useFormContext } from 'react-hook-form'
import { ErrorMessage } from './ErrorMessage'

interface TimeFormProps {
  name: string
  defaultTimeOnSelect?: { hours: number; minutes: number; seconds: number }
}

export function TimeForm({ name, defaultTimeOnSelect }: TimeFormProps) {
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
        defaultValue={field.value}
        defaultTimeOnSelect={defaultTimeOnSelect}
      />
      {errors[name] && <ErrorMessage />}
    </div>
  )
}
