import { Button } from '@/components/ui/button'
import type { Testcase } from '@generated/graphql'
import { type FieldErrorsImpl, useFormContext } from 'react-hook-form'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { toast } from 'sonner'
import Label from '../../_components/Label'
import { isInvalid } from '../_libs/utils'
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
      { input: '', output: '', isHidden, scoreWeight: '' }
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

  const equalDistribution = () => {
    const currentValues: Testcase[] = getValues('testcases')

    const totalAssignedScore = currentValues
      .map((tc) => tc.scoreWeight)
      .filter((score) => !isInvalid(score))
      .reduce((acc: number, score) => acc + score!, 0)

    const remainingScore = 100 - totalAssignedScore

    const unassignedTestcases = currentValues.filter((tc) =>
      isInvalid(tc.scoreWeight)
    )
    const unassignedCount = unassignedTestcases.length

    if (unassignedCount === 0) {
      toast.warning(`All testcases already have score weights assigned`)
      return
    }

    const baseScore = Math.floor(remainingScore / unassignedCount)
    const extraScore = remainingScore - baseScore * unassignedCount

    const updatedTestcases = currentValues.map((tc, index) => {
      if (isInvalid(tc.scoreWeight)) {
        const newScore =
          baseScore + (index === currentValues.length - 1 ? extraScore : 0)
        return { ...tc, scoreWeight: newScore }
      }
      return tc
    })

    setValue('testcases', updatedTestcases)
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
      <div className="flex w-full justify-end">
        <Button
          className="flex h-9 w-40 items-center gap-2 px-0"
          type="button"
          onClick={equalDistribution}
        >
          <IoIosCheckmarkCircle fontSize={20} />
          <p>Equal Distribution</p>
        </Button>
      </div>
    </div>
  )
}
