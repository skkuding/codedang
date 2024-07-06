import type { Sample } from '@generated/graphql'
import type { FieldErrorsImpl } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import { PiWarningBold } from 'react-icons/pi'
import { toast } from 'sonner'
import ExampleTextarea from './ExampleTextarea'

export default function SampleForm() {
  const {
    formState: { errors },
    watch,
    register,
    getValues,
    setValue
  } = useFormContext()

  const removeSample = (index: number) => {
    const currentValues: Sample[] = getValues('samples.create')
    if (currentValues.length <= 1) {
      toast.warning('At least one sample is required')
      return
    }
    const updatedValues = currentValues.filter((_, i) => i !== index)
    setValue('samples.create', updatedValues)
  }

  const watchedSamples: Sample[] = watch('samples.create')

  const sampleErrors = (
    errors.samples as FieldErrorsImpl<{ create: Sample[] }> | undefined
  )?.create

  return (
    <div className="flex flex-col gap-2">
      {watchedSamples &&
        watchedSamples.map((_, index) => (
          <div key={index} className="flex flex-col gap-1">
            <ExampleTextarea
              onRemove={() => {
                removeSample(index)
              }}
              inputName={`samples.create.${index}.input`}
              outputName={`samples.create.${index}.output`}
              register={register}
            />
            {sampleErrors && sampleErrors[index] && (
              <div className="flex items-center gap-1 text-xs text-red-500">
                <PiWarningBold />
                required
              </div>
            )}
          </div>
        ))}
    </div>
  )
}
