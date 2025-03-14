'use client'

import { TextEditor } from '@/components/TextEditor'
import { useController, useFormContext } from 'react-hook-form'
import { ErrorMessage } from './ErrorMessage'

interface SummaryFormProps {
  name: string
  isDarkmode?: boolean
}

export function SummaryForm({ name, isDarkmode = false }: SummaryFormProps) {
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
      <div className="h-[280px] w-full rounded-xl border bg-white">
        {/* Temporary Summary div */}
      </div>
      {errors[name] && <ErrorMessage />}
    </div>
  )
}
