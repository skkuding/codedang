import type { Testcase } from '@generated/graphql'
import type { FieldErrorsImpl } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import ErrorMessage from './ErrorMessage'
import ExampleTextarea from './ExampleTextarea'

export default function TestcaseForm() {
  const {
    formState: { errors },
    watch,
    register,
    getValues,
    setValue
  } = useFormContext()

  const removeTestcase = (index: number) => {
    const currentValues: Testcase[] = getValues('testcases')
    if ((currentValues?.length ?? 0) <= 1) {
      toast.warning('At least one testcase is required')
      return
    }
    const updatedValues = currentValues?.filter((_, i) => i !== index)
    setValue('testcases', updatedValues)
  }

  const watchedTestcases: Testcase[] = watch('testcases')

  const testcaseErrors = errors.testcases as
    | FieldErrorsImpl<Testcase[]>
    | undefined

  return (
    <div className="flex flex-col gap-2">
      {watchedTestcases &&
        watchedTestcases.map((_, index) => (
          <div key={index} className="flex flex-col gap-1">
            <ExampleTextarea
              key={index}
              onRemove={() => removeTestcase(index)}
              inputName={`testcases.${index}.input`}
              outputName={`testcases.${index}.output`}
              register={register}
            />
            {testcaseErrors && testcaseErrors[index] && <ErrorMessage />}
          </div>
        ))}
    </div>
  )
}
