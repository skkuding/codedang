import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useFormContext } from 'react-hook-form'
import { inputStyle } from '../utils'
import ErrorMessage from './ErrorMessage'

export default function LimitForm() {
  const {
    formState: { errors },
    register,
    getValues
  } = useFormContext()

  return (
    <div className="flex gap-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Input
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
        {errors.timeLimit && Number.isNaN(getValues('timeLimit')) ? (
          <ErrorMessage />
        ) : (
          <ErrorMessage message={errors.timeLimit?.message?.toString()} />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Input
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
        {errors.memoryLimit && Number.isNaN(getValues('memoryLimit')) ? (
          <ErrorMessage />
        ) : (
          <ErrorMessage message={errors.memoryLimit?.message?.toString()} />
        )}
      </div>
    </div>
  )
}
