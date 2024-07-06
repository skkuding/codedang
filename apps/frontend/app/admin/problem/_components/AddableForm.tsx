import type { FieldErrorsImpl } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import ErrorMessage from './ErrorMessage'
import ExampleTextarea from './ExampleTextarea'

type AddableProps = {
  type: string
  fieldName: string
  minimumRequired: number
}

export default function AddableForm<
  T extends { input: string; output: string }
>({ type, fieldName, minimumRequired }: AddableProps) {
  const {
    formState: { errors },
    watch,
    register,
    getValues,
    setValue
  } = useFormContext()

  const removeItem = (index: number) => {
    const currentValues: T[] = getValues(fieldName)
    if (currentValues.length <= minimumRequired) {
      toast.warning(`At least ${minimumRequired} ${type} is required`)
      return
    }
    const updatedValues = currentValues.filter((_, i) => i !== index)
    setValue(fieldName, updatedValues)
  }

  const watchedItems: T[] = watch(fieldName)

  const itemErrors = errors[fieldName] as FieldErrorsImpl<T[]> | undefined

  return (
    <div className="flex flex-col gap-2">
      {watchedItems &&
        watchedItems.map((_, index) => (
          <div key={index} className="flex flex-col gap-1">
            <ExampleTextarea
              onRemove={() => removeItem(index)}
              inputName={`${fieldName}.${index}.input`}
              outputName={`${fieldName}.${index}.output`}
              register={register}
            />
            {itemErrors && itemErrors[index] && <ErrorMessage />}
          </div>
        ))}
    </div>
  )
}
