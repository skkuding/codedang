'use client'

import { useController, useFormContext } from 'react-hook-form'
import { ErrorMessage } from './ErrorMessage'
import { TextEditor } from './TextEditor'

interface DescriptionFormProps {
  name: string
  isDarkmode?: boolean
}

// NOTE: 이미지 안넣기??
// TODO: 앞으로가기, 뒤로가기, 링크해제기능 -> 다른 부원이 작업중
export function DescriptionForm({
  name
  // isDarkmode = false
}: DescriptionFormProps) {
  const {
    control,
    formState: { errors }
  } = useFormContext()

  const { field } = useController({
    name,
    control
  })

  return (
    <div className="flex flex-col gap-1">
      <TextEditor
        placeholder="Enter a description..."
        onChange={field.onChange}
        defaultValue={field.value as string}
        // isDarkMode={isDarkmode}
      />
      {errors[name] && <ErrorMessage />}
    </div>
  )
}
