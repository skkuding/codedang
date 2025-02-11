import { Input } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
import { useSettingsContext } from './context'

interface StudentIdSectionProps {
  studentId: string
}

export function StudentIdSection({ studentId }: StudentIdSectionProps) {
  const {
    isLoading,
    updateNow,
    defaultProfileValues,
    formState: { register, errors }
  } = useSettingsContext()

  return (
    <>
      <label className="-mb-4 mt-2 text-xs">Student ID</label>
      <Input
        placeholder={(() => {
          if (updateNow) {
            return '2024123456'
          }
          return isLoading ? 'Loading...' : defaultProfileValues.studentId
        })()}
        disabled={!updateNow}
        {...register('studentId')}
        className={cn(
          'text-neutral-600 placeholder:text-neutral-400 focus-visible:ring-0',
          (() => {
            if (updateNow) {
              return errors.studentId || !studentId
                ? 'border-red-500'
                : 'border-primary'
            }
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
