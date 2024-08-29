import { Testcase } from '@generated/graphql'
import { type FieldErrorsImpl, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import Label from '../../_components/Label'
import AddBadge from './AddBadge'
import TestcaseItem from './TestcaseItem'

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
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <Label required={false}>Sample Testcase</Label>
        {watchedItems.map(
          (item, index) =>
            !item.isHidden && (
              <TestcaseItem
                key={index}
                index={index}
                itemError={itemErrors}
                onRemove={() => removeItem(index)}
                register={register}
              />
            )
        )}
        <AddBadge onClick={() => addTestcase(false)} />
      </div>
      <div className="flex flex-col gap-4">
        <Label required={false}>Hidden Testcase</Label>
        {watchedItems.map(
          (item, index) =>
            item.isHidden && (
              <TestcaseItem
                key={index}
                index={index}
                itemError={itemErrors}
                onRemove={() => removeItem(index)}
                register={register}
              />
            )
        )}
        <AddBadge onClick={() => addTestcase(true)} />
      </div>
    </div>
  )
}
