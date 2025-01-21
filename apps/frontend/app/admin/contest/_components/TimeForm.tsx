import { DateTimePickerDemo } from '@/components/shadcn/date-time-picker-demo'
import { useController, useFormContext } from 'react-hook-form'
import { ErrorMessage } from '../../_components/ErrorMessage'

export function TimeForm({ name }: { name: string }) {
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
      />
      {errors[name] && <ErrorMessage />}
    </div>
  )
}
