import { cn } from '@/libs/utils'
import type { Testcase } from '@generated/graphql'
import { use, useEffect } from 'react'
import {
  type FieldErrorsImpl,
  useController,
  useFormContext
} from 'react-hook-form'
import { ErrorMessage } from '../../_components/ErrorMessage'
import { isInvalid } from '../_libs/utils'
import { ExampleTextarea } from './ExampleTextarea'

interface TestcaseItemProps {
  blockEdit?: boolean
  index: number
  currentIndex: number
  itemError: FieldErrorsImpl | undefined
  onRemove: () => void
}

export function TestcaseItem({
  blockEdit,
  index,
  currentIndex,
  itemError,
  onRemove
}: TestcaseItemProps) {
  const { control, getValues, register } = useFormContext()

  const { field: isHiddenField } = useController({
    name: `testcases.${index}.isHidden`,
    control
  })

  const scoreWeightError = (itemError?.[index] as FieldErrorsImpl<Testcase>)
    ?.scoreWeight
  const message = scoreWeightError?.message

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-lg font-medium text-[#5C5C5C]">
            #{(currentIndex + 1).toString().padStart(2, '0')}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <div className="mr-2 flex">
            {/* <label className="flex items-center gap-2">
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
                  isHiddenField.value === false
                    ? 'font-medium text-gray-500'
                    : 'text-gray-400'
                )}
              >
                sample
              </p>
            </label> */}

            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                className="text-primary-light"
                onBlur={isHiddenField.onBlur}
                onChange={(e) => isHiddenField.onChange(e.target.checked)}
                checked={isHiddenField.value}
              />
              <p
                className={cn(
                  'text-base font-medium text-[#737373]'
                  // isHiddenField.value === true
                  //   ? 'font-medium text-gray-500'
                  //   : 'text-gray-400'
                )}
              >
                Hidden
              </p>
            </label>
          </div>
          <input
            disabled={blockEdit}
            {...register(`testcases.${index}.scoreWeight`, {
              setValueAs: (value) => (isInvalid(value) ? null : Number(value))
            })}
            type="number"
            min={0}
            className={cn(
              'hide-spin-button h-7 w-20 rounded-[1000px] border border-[1px] px-2 py-1 text-center text-base font-medium',
              isInvalid(getValues('testcases')[index].scoreWeight)
                ? 'border-gray-[#D8D8D8]'
                : 'border-gray-300'
            )}
            onWheel={(event) => {
              event.currentTarget.blur()
            }}
            {...register(`testcases.${index}.scoreWeight`)}
          />{' '}
          <span className="text-sm font-semibold text-[#737373]">(%)</span>
        </div>
      </div>
      <ExampleTextarea
        blockEdit={blockEdit}
        onRemove={onRemove}
        inputName={`testcases.${index}.input`}
        outputName={`testcases.${index}.output`}
        register={register}
      />
      {typeof message === 'string' && <ErrorMessage message={message} />}
    </div>
  )
}
