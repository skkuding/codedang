import { cn } from '@/lib/utils'
import {
  type FieldErrorsImpl,
  useController,
  useFormContext
} from 'react-hook-form'
import ErrorMessage from '../../_components/ErrorMessage'
import { isInvalid } from '../_libs/utils'
import ExampleTextarea from './ExampleTextarea'

interface TestcaseItemProps {
  index: number
  itemError: FieldErrorsImpl | undefined
  onRemove: () => void
}

export default function TestcaseItem({
  index,
  itemError,
  onRemove
}: TestcaseItemProps) {
  const { control, getValues, register } = useFormContext()

  const { field: isHiddenField } = useController({
    name: `testcases.${index}.isHidden`,
    control
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="font-medium text-gray-600">
            Testcase {(index + 1).toString().padStart(2, '0')}
          </p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                className="text-primary-light"
                onBlur={isHiddenField.onBlur}
                onChange={() => isHiddenField.onChange(false)}
                checked={isHiddenField.value === false}
              />
              <p
                className={cn(
                  'text-sm',
                  isHiddenField.value == false
                    ? 'font-medium text-gray-500'
                    : 'text-gray-400'
                )}
              >
                sample
              </p>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                className="text-primary-light"
                onBlur={isHiddenField.onBlur}
                onChange={() => isHiddenField.onChange(true)}
                checked={isHiddenField.value === true}
              />
              <p
                className={cn(
                  'text-sm',
                  isHiddenField.value == true
                    ? 'font-medium text-gray-500'
                    : 'text-gray-400'
                )}
              >
                hidden
              </p>
            </label>
          </div>
        </div>

        <div>
          <input
            {...register(`testcases.${index}.scoreWeight`, {
              setValueAs: (value) => (isInvalid(value) ? null : Number(value))
            })}
            type="number"
            min={0}
            className={cn(
              'h-5 w-8 rounded-sm border text-center text-xs',
              '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
              isInvalid(getValues('testcases')[index].scoreWeight)
                ? 'border-red-500'
                : 'border-gray-300'
            )}
          />{' '}
          (%)
        </div>
      </div>
      <ExampleTextarea
        onRemove={onRemove}
        inputName={`testcases.${index}.input`}
        outputName={`testcases.${index}.output`}
        register={register}
      />
      {itemError && itemError[index] && <ErrorMessage />}
    </div>
  )
}
