'use client'

import { useTranslate } from '@tolgee/react'
import { useFormContext, useController } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { ErrorMessage } from './ErrorMessage'

export function VisibleForm({ blockEdit = false }: { blockEdit?: boolean }) {
  const {
    control,
    formState: { errors }
  } = useFormContext()

  const { field: isVisibleField } = useController({
    name: 'isVisible',
    control,
    defaultValue: true
  })

  const { t } = useTranslate()

  return (
    <>
      <div className="mb-3 flex items-center">
        <div className="flex gap-14">
          <label className="flex gap-2">
            <input
              type="radio"
              onBlur={isVisibleField.onBlur}
              onChange={() => isVisibleField.onChange(true)}
              checked={isVisibleField.value === true}
              className="text-primary-light"
              disabled={blockEdit}
            />
            <FaEye className="text-gray-400" size={18} />
          </label>
          <label className="flex gap-2">
            <input
              type="radio"
              onBlur={isVisibleField.onBlur}
              onChange={() => isVisibleField.onChange(false)}
              checked={isVisibleField.value === false}
              className="text-primary-light"
              disabled={blockEdit}
            />
            <FaEyeSlash className="text-gray-400" size={18} />
          </label>
        </div>
      </div>
      {errors.isVisible && (
        <ErrorMessage message={t('error_message_required')} />
      )}
    </>
  )
}
