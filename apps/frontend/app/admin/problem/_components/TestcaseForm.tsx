import { Testcase } from '@generated/graphql'
import { type FieldErrorsImpl, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import ErrorMessage from '../../_components/ErrorMessage'
import Label from '../../_components/Label'
import AddBadge from './AddBadge'
import ExampleTextarea from './ExampleTextarea'

export default function TestcaseField() {
  const {
    formState: { errors },
    watch,
    register,
    getValues,
    setValue
  } = useFormContext()

  const addTestcase = (isHidden: boolean) => {
    setValue('testcases', [
      ...getValues('testcases'),
      { input: '', output: '', isHidden, scoreWeight: null }
    ])
  }

  const removeItem = (index: number) => {
    const currentValues: Testcase[] = getValues('testcases')
    if (currentValues.length <= 1) {
      toast.warning(`At least 1 testcase is required`)
      return
    }
    const updatedValues = currentValues.filter((_, i) => i !== index)
    setValue('testcases', updatedValues)
  }

  const watchedItems: Testcase[] = watch('testcases')

  const itemErrors = errors.testcases as FieldErrorsImpl

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label required={false}>Sample Testcase</Label>
        </div>
        {watchedItems.map(
          (item, index) =>
            !item.isHidden && (
              <div key={index} className="flex flex-col gap-1">
                <input
                  {...register(`testcases.${index}.scoreWeight`, {
                    valueAsNumber: true
                  })}
                />
                <ExampleTextarea
                  onRemove={() => removeItem(index)}
                  inputName={`testcases.${index}.input`}
                  outputName={`testcases.${index}.output`}
                  register={register}
                />
                {itemErrors && itemErrors[index] && <ErrorMessage />}
              </div>
            )
        )}
        <AddBadge onClick={() => addTestcase(false)} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label required={false}>Hidden Testcase</Label>
        </div>
        {watchedItems.map(
          (item, index) =>
            item.isHidden && (
              <div key={index} className="flex flex-col gap-1">
                <input
                  {...register(`testcases.${index}.scoreWeight`, {
                    valueAsNumber: true
                  })}
                />
                <ExampleTextarea
                  onRemove={() => removeItem(index)}
                  inputName={`testcases.${index}.input`}
                  outputName={`testcases.${index}.output`}
                  register={register}
                />
                {itemErrors && itemErrors[index] && <ErrorMessage />}
              </div>
            )
        )}
        <AddBadge onClick={() => addTestcase(true)} />
      </div>
    </div>
  )
}
