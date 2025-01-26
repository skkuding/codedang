'use client'

import { useFormContext, useController } from 'react-hook-form'
import { TbPinned, TbPinnedOff } from 'react-icons/tb'
import { ErrorMessage } from '../../_components/ErrorMessage'

export function FixedForm({ blockEdit = false }: { blockEdit?: boolean }) {
  const {
    control,
    formState: { errors }
  } = useFormContext()

  const { field: isFixedField } = useController({
    name: 'isFixed',
    control,
    defaultValue: true
  })

  return (
    <>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex gap-14">
          <label className="flex gap-2">
            <input
              type="radio"
              onBlur={isFixedField.onBlur}
              onChange={() => isFixedField.onChange(true)}
              checked={isFixedField.value === true}
              className="text-primary-light"
              disabled={blockEdit}
            />
            <TbPinned className="text-gray-400" size={20} />
          </label>
          <label className="flex gap-2">
            <input
              type="radio"
              onBlur={isFixedField.onBlur}
              onChange={() => isFixedField.onChange(false)}
              checked={isFixedField.value === false}
              className="text-primary-light"
              disabled={blockEdit}
            />
            <TbPinnedOff className="text-gray-400" size={20} />
          </label>
        </div>
      </div>
      {errors.isFixed && <ErrorMessage message="required" />}
    </>
  )
}
