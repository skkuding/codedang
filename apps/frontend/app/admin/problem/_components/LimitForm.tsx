'use client'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useFormContext } from 'react-hook-form'
import ErrorMessage from '../../_components/ErrorMessage'
import { inputStyle } from '../../_libs/utils'

export default function LimitForm({ blockEdit }: { blockEdit?: boolean }) {
  const {
    formState: { errors },
    register
  } = useFormContext()

  return (
    <div className="flex gap-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Input
            disabled={blockEdit}
            id="time"
            type="number"
            min={0}
            placeholder="Time"
            className={cn(inputStyle, 'h-[36px] w-[112px]')}
            {...register('timeLimit', {
              setValueAs: (value: string) => parseInt(value, 10)
            })}
          />
          <p className="text-sm font-bold text-gray-600">ms</p>
        </div>
        {errors.timeLimit && <ErrorMessage />}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Input
            disabled={blockEdit}
            id="memory"
            type="number"
            min={0}
            placeholder="Memory"
            className={cn(inputStyle, 'h-[36px] w-[112px]')}
            {...register('memoryLimit', {
              setValueAs: (value: string) => parseInt(value, 10)
            })}
          />
          <p className="text-sm font-bold text-gray-600">MB</p>
        </div>
        {errors.memoryLimit && <ErrorMessage />}
      </div>
    </div>
  )
}
