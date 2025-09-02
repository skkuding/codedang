import { cn } from '@/libs/utils'
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
  onSelect: (isSelected: boolean) => void
  isSelected: boolean
}

export function TestcaseItem({
  blockEdit,
  index,
  currentIndex,
  itemError,
  onRemove,
  onSelect,
  isSelected
}: TestcaseItemProps) {
  const { control, getValues, register, setValue, trigger } = useFormContext()

  const { field: isHiddenField } = useController({
    name: `testcases.${index}.isHidden`,
    control
  })

  const scoreWeightError = itemError?.[index]
  const message = scoreWeightError?.root?.message

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-lg font-medium text-[#5C5C5C]">
            #{(currentIndex + 1).toString().padStart(2, '0')}
          </p>
          {!blockEdit && (
            <input
              type="checkbox"
              className="text-primary-light h-5 w-5"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
            />
          )}
        </div>

        <div className="flex items-center gap-1">
          {!blockEdit && (
            <div className="mr-2 flex">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  className="text-primary-light h-4 w-4"
                  onBlur={isHiddenField.onBlur}
                  onChange={(e) => {
                    isHiddenField.onChange(e.target.checked)
                  }}
                  checked={isHiddenField.value}
                />
                <p
                  className={cn(
                    'text-base font-medium text-[#737373]',
                    isHiddenField.value === true
                      ? 'font-medium text-gray-500'
                      : 'text-gray-400'
                  )}
                >
                  Hidden
                </p>
              </label>
            </div>
          )}
          {getValues(`testcases.${index}.scoreWeightNumerator`) ? (
            <div className="relative flex items-center">
              <input
                readOnly
                type="text"
                value={`${(
                  (getValues(`testcases.${index}.scoreWeightNumerator`) /
                    getValues(`testcases.${index}.scoreWeightDenominator`)) *
                  100
                ).toFixed(2)}`}
                className="hide-spin-button bg-color-neutral-99 h-7 w-24 rounded-[1000px] border px-2 py-1 text-center"
              />
            </div>
          ) : (
            <input
              disabled={blockEdit}
              {...register(`testcases.${index}.scoreWeight`, {
                setValueAs: (value) => {
                  if (isInvalid(value)) {
                    return undefined
                  }
                  return Number(value)
                },
                onChange: (e) => {
                  const numericValue = e.target.value.replace(/\D/g, '')
                  e.target.value = numericValue
                  trigger(`testcases.${index}`)
                  setValue(`testcases.${index}.scoreWeightNumerator`, null)
                  setValue(`testcases.${index}.scoreWeightDenominator`, null)
                }
              })}
              type="text"
              inputMode="numeric"
              className="hide-spin-button h-7 w-24 rounded-[1000px] border px-2 py-1 text-center"
            />
          )}{' '}
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
