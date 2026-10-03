import { Input } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
import { useSettingsContext } from './context'

export function StudentIdSection() {
  const {
    isLoading,
    defaultProfileValues,
    formState: { register, errors }
  } = useSettingsContext()

  return (
    <>
      <label className="-mb-4 mt-2 text-xs">Student ID</label>
      <Input
        placeholder={(() => {
          return isLoading ? 'Loading...' : defaultProfileValues.studentId
        })()}
        disabled={true}
        {...register('studentId')}
        className={cn(
          'text-neutral-600 placeholder:text-neutral-400 focus-visible:ring-0',
          (() => {
            return 'border-neutral-300 disabled:bg-neutral-200'
          })()
        )}
      />
      {errors.studentId && (
        <div className="-mt-4 inline-flex items-center text-xs text-red-500">
          {errors.studentId.message}
        </div>
      )}
    </>
  )
}
