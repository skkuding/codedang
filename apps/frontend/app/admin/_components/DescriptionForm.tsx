'use client'

import { useTranslate } from '@tolgee/react'
import { useEffect } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import { ErrorMessage } from './ErrorMessage'
import { TextEditor } from './TextEditor'

interface DescriptionFormProps {
  name: string
  isContest?: boolean
  isDarkmode?: boolean
}

// NOTE: Contest는 description이 null일 수 있음(필수 항목이 아님)
export function DescriptionForm({
  name,
  isContest = false,
  isDarkmode = false
}: DescriptionFormProps) {
  const {
    control,
    formState: { errors }
  } = useFormContext()

  const { field } = useController({
    name,
    control
  })

  const { t } = useTranslate()

  // NOTE: Contest는 description이 필수 항목이 아니므로 description 값이 아닐때는 null로 초기화
  useEffect(() => {
    if (isContest && field.value === '<p></p>') {
      field.onChange(null)
    }
  }, [field.value, isContest])

  useEffect(() => {
    field.onChange(field.value)
  }, [])

  return (
    <div className="flex flex-col gap-1 [&_.ProseMirror>p]:mt-0">
      <TextEditor
        placeholder={t('enter_description_placeholder')}
        onChange={field.onChange}
        defaultValue={field.value as string}
        isDarkMode={isDarkmode}
      />
      {errors[name] && (
        <ErrorMessage
          {...(isContest && {
            message: `${errors[name]?.message?.toString()}`
          })}
        />
      )}
    </div>
  )
}
